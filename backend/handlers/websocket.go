package handlers

import (
	"log"
	"net/http"

	"laundry-app/store"
	ws "laundry-app/websocket"

	gorilla "github.com/gorilla/websocket"
)

var upgrader = gorilla.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		// Allow all origins in development
		return true
	},
}

type WSHandler struct {
	store *store.Store
	hub   *ws.Hub
}

func NewWSHandler(s *store.Store, h *ws.Hub) *WSHandler {
	return &WSHandler{store: s, hub: h}
}

func (h *WSHandler) ServeWS(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("websocket upgrade error: %v", err)
		return
	}

	client := ws.NewClient(h.hub, conn)
	h.hub.Register <- client

	// Send full machine state to this new client immediately
	initMsg := ws.BuildInitMessage(h.store.GetAll())
	client.GetSendChan() <- initMsg

	go client.WritePump()
	go client.ReadPump()
}
