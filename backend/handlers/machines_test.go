package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"laundry-app/models"
	"laundry-app/store"
	ws "laundry-app/websocket"
)

func newTestHandler() *MachineHandler {
	s := store.NewStore()
	hub := ws.NewHub()
	go hub.Run()
	return NewMachineHandler(s, hub)
}

func TestGetMachines(t *testing.T) {
	h := newTestHandler()
	req := httptest.NewRequest("GET", "/api/machines", nil)
	rec := httptest.NewRecorder()

	h.GetMachines(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rec.Code)
	}

	var machines []models.Machine
	if err := json.Unmarshal(rec.Body.Bytes(), &machines); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	if len(machines) != 3 {
		t.Errorf("expected 3 machines, got %d", len(machines))
	}
}

func TestClaimMachine_Success(t *testing.T) {
	h := newTestHandler()
	body := `{"name":"Alice","apartment":"3B","duration_min":60}`
	req := httptest.NewRequest("POST", "/api/machines/1/claim", bytes.NewBufferString(body))
	req.SetPathValue("id", "1")
	rec := httptest.NewRecorder()

	h.ClaimMachine(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rec.Code, rec.Body.String())
	}

	var m models.Machine
	json.Unmarshal(rec.Body.Bytes(), &m)
	if m.Status != models.StatusInUse {
		t.Errorf("expected in_use, got %s", m.Status)
	}
}

func TestClaimMachine_Conflict(t *testing.T) {
	h := newTestHandler()
	body := `{"name":"Alice","apartment":"3B","duration_min":60}`

	// First claim
	req1 := httptest.NewRequest("POST", "/api/machines/1/claim", bytes.NewBufferString(body))
	req1.SetPathValue("id", "1")
	rec1 := httptest.NewRecorder()
	h.ClaimMachine(rec1, req1)

	// Second claim on same machine
	req2 := httptest.NewRequest("POST", "/api/machines/1/claim", bytes.NewBufferString(body))
	req2.SetPathValue("id", "1")
	rec2 := httptest.NewRecorder()
	h.ClaimMachine(rec2, req2)

	if rec2.Code != http.StatusConflict {
		t.Errorf("expected 409 Conflict, got %d", rec2.Code)
	}
}

func TestClaimMachine_InvalidID(t *testing.T) {
	h := newTestHandler()
	body := `{"name":"Alice","apartment":"3B","duration_min":60}`
	req := httptest.NewRequest("POST", "/api/machines/abc/claim", bytes.NewBufferString(body))
	req.SetPathValue("id", "abc")
	rec := httptest.NewRecorder()

	h.ClaimMachine(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Errorf("expected 400, got %d", rec.Code)
	}
}

func TestClaimMachine_MissingFields(t *testing.T) {
	h := newTestHandler()
	body := `{"name":"","apartment":"","duration_min":0}`
	req := httptest.NewRequest("POST", "/api/machines/1/claim", bytes.NewBufferString(body))
	req.SetPathValue("id", "1")
	rec := httptest.NewRecorder()

	h.ClaimMachine(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Errorf("expected 400 for missing fields, got %d", rec.Code)
	}
}

func TestReleaseMachine_Success(t *testing.T) {
	h := newTestHandler()

	// Claim first
	body := `{"name":"Alice","apartment":"3B","duration_min":60}`
	req1 := httptest.NewRequest("POST", "/api/machines/2/claim", bytes.NewBufferString(body))
	req1.SetPathValue("id", "2")
	rec1 := httptest.NewRecorder()
	h.ClaimMachine(rec1, req1)

	// Now release
	req2 := httptest.NewRequest("POST", "/api/machines/2/release", nil)
	req2.SetPathValue("id", "2")
	rec2 := httptest.NewRecorder()
	h.ReleaseMachine(rec2, req2)

	if rec2.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rec2.Code, rec2.Body.String())
	}

	var m models.Machine
	json.Unmarshal(rec2.Body.Bytes(), &m)
	if m.Status != models.StatusAvailable {
		t.Errorf("expected available after release, got %s", m.Status)
	}
}
