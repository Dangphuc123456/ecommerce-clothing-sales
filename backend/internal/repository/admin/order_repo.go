// internal/repository/admin/order_repository.go
package admin

import (
	"backend/configs"
	"backend/internal/models"
)

// Lấy tất cả orders
func GetAllOrders() ([]models.Order, error) {
	var orders []models.Order
	err := configs.DB.
		Preload("Customer").
		Preload("Staff").
		Preload("Items.Variant.Product").
		Find(&orders).Error
	return orders, err
}

// Lấy chi tiết 1 order
func GetOrderDetail(id uint) (*models.Order, error) {
	var order models.Order
	err := configs.DB.
		Preload("Customer").
		Preload("Staff").
		Preload("Items.Variant.Product").
		First(&order, id).Error
	if err != nil {
		return nil, err
	}
	return &order, nil
}

// Cập nhật trạng thái order
func UpdateOrderStatus(id uint, status string, staffID *uint) error {
	return configs.DB.Model(&models.Order{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"status":   status,
			"staff_id": staffID,
		}).Error
}
