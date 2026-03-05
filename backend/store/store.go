package store

import (
	"fmt"
	"sync"
	"time"

	"laundry-app/models"
)

type Store struct {
	mu       sync.RWMutex
	machines map[int]*models.Machine
}

func NewStore() *Store {
	s := &Store{machines: make(map[int]*models.Machine)}
	for i := 1; i <= 6; i++ {
		s.machines[i] = &models.Machine{ID: i, Status: models.StatusAvailable}
	}
	return s
}

func (s *Store) GetAll() []models.Machine {
	s.mu.RLock()
	defer s.mu.RUnlock()

	now := time.Now()
	result := make([]models.Machine, 0, 6)
	for i := 1; i <= 6; i++ {
		m := *s.machines[i]
		if m.Status == models.StatusInUse && m.ExpiresAt != nil {
			remaining := int(m.ExpiresAt.Sub(now).Seconds())
			if remaining < 0 {
				remaining = 0
			}
			m.TimeLeft = remaining
		}
		result = append(result, m)
	}
	return result
}

func (s *Store) GetOne(id int) (models.Machine, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	m, ok := s.machines[id]
	if !ok {
		return models.Machine{}, fmt.Errorf("machine %d not found", id)
	}
	result := *m
	if result.Status == models.StatusInUse && result.ExpiresAt != nil {
		remaining := int(result.ExpiresAt.Sub(time.Now()).Seconds())
		if remaining < 0 {
			remaining = 0
		}
		result.TimeLeft = remaining
	}
	return result, nil
}

func (s *Store) Claim(id int, req models.ClaimRequest) (models.Machine, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	m, ok := s.machines[id]
	if !ok {
		return models.Machine{}, fmt.Errorf("machine %d not found", id)
	}
	if m.Status == models.StatusInUse {
		return models.Machine{}, fmt.Errorf("machine %d is already in use", id)
	}

	expiresAt := time.Now().Add(time.Duration(req.DurationMin) * time.Minute)
	m.Status = models.StatusInUse
	m.User = &models.MachineUser{
		Name:      req.Name,
		Apartment: req.Apartment,
		Phone:     req.Phone,
	}
	m.ExpiresAt = &expiresAt
	m.TimeLeft = req.DurationMin * 60

	return *m, nil
}

func (s *Store) Release(id int) (models.Machine, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	m, ok := s.machines[id]
	if !ok {
		return models.Machine{}, fmt.Errorf("machine %d not found", id)
	}

	m.Status = models.StatusAvailable
	m.User = nil
	m.ExpiresAt = nil
	m.TimeLeft = 0

	return *m, nil
}

// GetExpired returns IDs of machines whose timers have expired.
func (s *Store) GetExpired() []int {
	s.mu.RLock()
	defer s.mu.RUnlock()

	now := time.Now()
	var expired []int
	for id, m := range s.machines {
		if m.Status == models.StatusInUse && m.ExpiresAt != nil && now.After(*m.ExpiresAt) {
			expired = append(expired, id)
		}
	}
	return expired
}
