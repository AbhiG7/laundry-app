package models

import "time"

type MachineStatus string

const (
	StatusAvailable MachineStatus = "available"
	StatusInUse     MachineStatus = "in_use"
)

type MachineUser struct {
	Name      string `json:"name"`
	Apartment string `json:"apartment"`
	Phone     string `json:"phone,omitempty"`
}

type Machine struct {
	ID        int           `json:"id"`
	Status    MachineStatus `json:"status"`
	User      *MachineUser  `json:"user,omitempty"`
	ExpiresAt *time.Time    `json:"expires_at,omitempty"`
	TimeLeft  int           `json:"time_left_seconds,omitempty"`
}

type ClaimRequest struct {
	Name        string `json:"name"`
	Apartment   string `json:"apartment"`
	DurationMin int    `json:"duration_min"`
	Phone       string `json:"phone"`
}
