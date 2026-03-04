package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"laundry-app/models"
	"laundry-app/store"
	ws "laundry-app/websocket"
)

type MachineHandler struct {
	store *store.Store
	hub   *ws.Hub
}

func NewMachineHandler(s *store.Store, h *ws.Hub) *MachineHandler {
	return &MachineHandler{store: s, hub: h}
}

func (h *MachineHandler) GetMachines(w http.ResponseWriter, r *http.Request) {
	machines := h.store.GetAll()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(machines)
}

func (h *MachineHandler) ClaimMachine(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, "invalid machine id", http.StatusBadRequest)
		return
	}

	var req models.ClaimRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if req.Name == "" || req.Apartment == "" || req.DurationMin <= 0 {
		http.Error(w, "name, apartment, and duration_min are required", http.StatusBadRequest)
		return
	}

	machine, err := h.store.Claim(id, req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusConflict)
		return
	}

	// Broadcast to all WebSocket clients
	h.hub.Broadcast <- ws.BuildMachineUpdateMessage(machine)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(machine)
}

func (h *MachineHandler) ReleaseMachine(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, "invalid machine id", http.StatusBadRequest)
		return
	}

	machine, err := h.store.Release(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	h.hub.Broadcast <- ws.BuildMachineReleasedMessage(machine.ID, "manual_release")

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(machine)
}
