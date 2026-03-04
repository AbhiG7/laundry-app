package timer

import (
	"log"
	"time"

	"laundry-app/store"
	"laundry-app/websocket"
)

// Manager handles server-side timer expiry and broadcasts.
type Manager struct {
	store  *store.Store
	hub    *websocket.Hub
	ticker *time.Ticker
}

func NewManager(s *store.Store, h *websocket.Hub) *Manager {
	return &Manager{
		store:  s,
		hub:    h,
		ticker: time.NewTicker(10 * time.Second),
	}
}

func (m *Manager) Run() {
	for range m.ticker.C {
		m.checkExpiredMachines()
		m.broadcastTimeUpdates()
	}
}

func (m *Manager) checkExpiredMachines() {
	expired := m.store.GetExpired()
	for _, id := range expired {
		machine, err := m.store.Release(id)
		if err != nil {
			log.Printf("timer: failed to release machine %d: %v", id, err)
			continue
		}
		log.Printf("timer: auto-released machine %d (timer expired)", id)

		// Broadcast the released machine state
		m.hub.Broadcast <- websocket.BuildMachineReleasedMessage(machine.ID, "timer_expired")
	}
}

func (m *Manager) broadcastTimeUpdates() {
	machines := m.store.GetAll()
	for _, machine := range machines {
		if machine.Status == "in_use" {
			m.hub.Broadcast <- websocket.BuildMachineUpdateMessage(machine)
		}
	}
}
