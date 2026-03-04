package main

import (
	"log"
	"net/http"

	"laundry-app/handlers"
	"laundry-app/store"
	"laundry-app/timer"
	ws "laundry-app/websocket"
)

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func main() {
	s := store.NewStore()
	hub := ws.NewHub()
	mgr := timer.NewManager(s, hub)

	go hub.Run()
	go mgr.Run()

	mux := http.NewServeMux()

	machineH := handlers.NewMachineHandler(s, hub)
	wsH := handlers.NewWSHandler(s, hub)

	mux.HandleFunc("GET /api/machines", machineH.GetMachines)
	mux.HandleFunc("POST /api/machines/{id}/claim", machineH.ClaimMachine)
	mux.HandleFunc("POST /api/machines/{id}/release", machineH.ReleaseMachine)
	mux.HandleFunc("GET /ws", wsH.ServeWS)

	log.Println("Laundry backend running on :8080")
	log.Fatal(http.ListenAndServe(":8080", corsMiddleware(mux)))
}
