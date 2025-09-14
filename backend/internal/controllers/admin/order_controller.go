// internal/controllers/admin/order_controller.go
package admin

import (
	orderRepo "backend/internal/repository/admin"
	 "backend/internal/models"
    "backend/configs"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

// GET ALL ORDERS
func GetAllOrders(w http.ResponseWriter, r *http.Request) {
	status := r.URL.Query().Get("status")

	var orders []models.Order
	query := configs.DB.
		Preload("Customer").
		Preload("Staff").
		Preload("Items.Variant.Product")

	if status != "" {
		query = query.Where("status = ?", status)
	}

	if err := query.Find(&orders).Error; err != nil {
		http.Error(w, "Failed to fetch orders", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"data": orders})
}

// GET ORDER DETAIL
func GetOrderDetail(w http.ResponseWriter, r *http.Request) {
	idParam := mux.Vars(r)["id"]
	id, err := strconv.Atoi(idParam)
	if err != nil {
		http.Error(w, "Invalid order ID", http.StatusBadRequest)
		return
	}
	order, err := orderRepo.GetOrderDetail(uint(id))
	if err != nil {
		http.Error(w, "Order not found", http.StatusNotFound)
		return
	}
	json.NewEncoder(w).Encode(order)
}

// UPDATE ORDER STATUS
func UpdateOrderStatus(w http.ResponseWriter, r *http.Request) {
	idParam := mux.Vars(r)["id"]
	id, err := strconv.Atoi(idParam)
	if err != nil {
		http.Error(w, "Invalid order ID", http.StatusBadRequest)
		return
	}

	var body struct {
		Status  string `json:"status"`
		StaffID *uint  `json:"staff_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	if err := orderRepo.UpdateOrderStatus(uint(id), body.Status, body.StaffID); err != nil {
		http.Error(w, "Failed to update order", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Order status updated"})
}
