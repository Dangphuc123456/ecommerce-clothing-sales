package main

import (
	"backend/configs"
	"backend/internal/models"
	"backend/internal/routes"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/rs/cors"
	"github.com/gorilla/mux"
)

func main() {
	// Kết nối database
	configs.ConnectDatabase()

	// Auto migrate
	if err := configs.DB.AutoMigrate(&models.User{}); err != nil {
		log.Fatal("Migration failed:", err)
	}

	r := mux.NewRouter()

	// Setup routes
	routes.SetupRoutes(r)
	// Nếu bạn có admin routes riêng
	routes.SetupAdminRoutes(r)

	// CORS middleware
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"}, // FE React
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Origin", "Content-Type", "Authorization"},
		ExposedHeaders:   []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           int((12 * time.Hour).Seconds()),
	})

	handler := c.Handler(r)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Println("🚀 Server running on port", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatal(err)
	}
}
