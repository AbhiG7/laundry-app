package store

import (
	"sync"
	"testing"
	"time"

	"laundry-app/models"
)

func TestNewStore_InitializesThreeMachines(t *testing.T) {
	s := NewStore()
	machines := s.GetAll()
	if len(machines) != 3 {
		t.Fatalf("expected 3 machines, got %d", len(machines))
	}
	for _, m := range machines {
		if m.Status != models.StatusAvailable {
			t.Errorf("expected machine %d to be available, got %s", m.ID, m.Status)
		}
	}
}

func TestClaim_Success(t *testing.T) {
	s := NewStore()
	req := models.ClaimRequest{Name: "Alice", Apartment: "3B", DurationMin: 60}
	m, err := s.Claim(1, req)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if m.Status != models.StatusInUse {
		t.Errorf("expected status in_use, got %s", m.Status)
	}
	if m.User.Name != "Alice" {
		t.Errorf("expected user name Alice, got %s", m.User.Name)
	}
	if m.ExpiresAt == nil {
		t.Error("expected ExpiresAt to be set")
	}
}

func TestClaim_AlreadyInUse(t *testing.T) {
	s := NewStore()
	req := models.ClaimRequest{Name: "Alice", Apartment: "3B", DurationMin: 60}
	_, err := s.Claim(1, req)
	if err != nil {
		t.Fatalf("first claim failed: %v", err)
	}
	_, err = s.Claim(1, models.ClaimRequest{Name: "Bob", Apartment: "2A", DurationMin: 30})
	if err == nil {
		t.Error("expected error when claiming already-in-use machine")
	}
}

func TestClaim_InvalidID(t *testing.T) {
	s := NewStore()
	_, err := s.Claim(99, models.ClaimRequest{Name: "X", Apartment: "1A", DurationMin: 30})
	if err == nil {
		t.Error("expected error for invalid machine ID")
	}
}

func TestRelease_Success(t *testing.T) {
	s := NewStore()
	req := models.ClaimRequest{Name: "Alice", Apartment: "3B", DurationMin: 60}
	_, err := s.Claim(1, req)
	if err != nil {
		t.Fatalf("claim failed: %v", err)
	}

	m, err := s.Release(1)
	if err != nil {
		t.Fatalf("release failed: %v", err)
	}
	if m.Status != models.StatusAvailable {
		t.Errorf("expected available after release, got %s", m.Status)
	}
	if m.User != nil {
		t.Error("expected user to be nil after release")
	}
}

func TestRelease_Idempotent(t *testing.T) {
	s := NewStore()
	// Releasing an already-available machine should not error
	_, err := s.Release(1)
	if err != nil {
		t.Errorf("expected idempotent release to succeed, got %v", err)
	}
}

func TestGetExpired(t *testing.T) {
	s := NewStore()
	req := models.ClaimRequest{Name: "Alice", Apartment: "3B", DurationMin: 1}
	_, _ = s.Claim(1, req)

	// Manually set ExpiresAt to the past
	s.mu.Lock()
	past := time.Now().Add(-1 * time.Minute)
	s.machines[1].ExpiresAt = &past
	s.mu.Unlock()

	expired := s.GetExpired()
	if len(expired) != 1 || expired[0] != 1 {
		t.Errorf("expected machine 1 to be expired, got %v", expired)
	}
}

func TestConcurrentClaims(t *testing.T) {
	s := NewStore()
	var wg sync.WaitGroup
	successCount := 0
	var mu sync.Mutex

	for i := 0; i < 10; i++ {
		wg.Add(1)
		go func(i int) {
			defer wg.Done()
			_, err := s.Claim(1, models.ClaimRequest{
				Name:        "User",
				Apartment:   "1A",
				DurationMin: 30,
			})
			if err == nil {
				mu.Lock()
				successCount++
				mu.Unlock()
			}
		}(i)
	}
	wg.Wait()

	if successCount != 1 {
		t.Errorf("expected exactly 1 successful claim, got %d", successCount)
	}
}

func TestGetAll_ComputesTimeLeft(t *testing.T) {
	s := NewStore()
	req := models.ClaimRequest{Name: "Alice", Apartment: "3B", DurationMin: 60}
	_, _ = s.Claim(1, req)

	machines := s.GetAll()
	var m1 models.Machine
	for _, m := range machines {
		if m.ID == 1 {
			m1 = m
			break
		}
	}

	// TimeLeft should be around 3600 seconds (60 min)
	if m1.TimeLeft < 3590 || m1.TimeLeft > 3600 {
		t.Errorf("expected TimeLeft ~3600, got %d", m1.TimeLeft)
	}
}
