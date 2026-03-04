package websocket

import (
	"encoding/json"

	"laundry-app/models"
)

type MessageType string

const (
	MsgInit            MessageType = "init"
	MsgMachineUpdate   MessageType = "machine_update"
	MsgMachineReleased MessageType = "machine_released"
)

type OutboundMessage struct {
	Type      MessageType      `json:"type"`
	Machines  []models.Machine `json:"machines,omitempty"`
	Machine   *models.Machine  `json:"machine,omitempty"`
	MachineID int              `json:"machine_id,omitempty"`
	Reason    string           `json:"reason,omitempty"`
}

func marshalMessage(msg OutboundMessage) []byte {
	b, _ := json.Marshal(msg)
	return b
}

func BuildInitMessage(machines []models.Machine) []byte {
	return marshalMessage(OutboundMessage{
		Type:     MsgInit,
		Machines: machines,
	})
}

func BuildMachineUpdateMessage(machine models.Machine) []byte {
	return marshalMessage(OutboundMessage{
		Type:    MsgMachineUpdate,
		Machine: &machine,
	})
}

func BuildMachineReleasedMessage(machineID int, reason string) []byte {
	return marshalMessage(OutboundMessage{
		Type:      MsgMachineReleased,
		MachineID: machineID,
		Machine:   &models.Machine{ID: machineID, Status: models.StatusAvailable},
		Reason:    reason,
	})
}
