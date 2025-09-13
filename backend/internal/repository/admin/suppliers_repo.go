package admin

import (
	"backend/configs"
	"backend/internal/models"
)

// Supplier CRUD
func GetAllSuppliers() ([]models.Supplier, error) {
	var suppliers []models.Supplier
	err := configs.DB.Find(&suppliers).Error
	return suppliers, err
}

func GetSupplierDetail(id uint) (*models.Supplier, error) {
	var supplier models.Supplier
	err := configs.DB.Preload("Purchases").First(&supplier, id).Error
	return &supplier, err
}

func CreateSupplier(s *models.Supplier) (*models.Supplier, error) {
	if err := configs.DB.Create(s).Error; err != nil {
		return nil, err
	}
	return s, nil
}

func UpdateSupplier(id uint, newData *models.Supplier) (*models.Supplier, error) {
	var s models.Supplier
	if err := configs.DB.First(&s, id).Error; err != nil {
		return nil, err
	}
	s.Name = newData.Name
	s.Phone = newData.Phone
	s.Email = newData.Email
	s.Address = newData.Address
	if err := configs.DB.Save(&s).Error; err != nil {
		return nil, err
	}
	return &s, nil
}

func DeleteSupplier(id uint) error {
	return configs.DB.Delete(&models.Supplier{}, id).Error
}
