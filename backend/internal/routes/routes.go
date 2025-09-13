package routes

import (
	"backend/internal/controllers"
	"github.com/gorilla/mux"
)

func SetupRoutes(r *mux.Router) {
	api := r.PathPrefix("/api").Subrouter()

	auth := api.PathPrefix("/auth").Subrouter()
	auth.HandleFunc("/register", controllers.RegisterHandler).Methods("POST")
	auth.HandleFunc("/confirm", controllers.ConfirmRegisterHandler).Methods("GET")
	auth.HandleFunc("/login", controllers.LoginHandler).Methods("POST")
}