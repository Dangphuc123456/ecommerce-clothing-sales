package repository

import (
	"backend/configs"
	"backend/internal/models"
)

func CreateUser(user *models.User) error {
	return configs.DB.Create(user).Error
}

func GetUserByEmail(email string) (*models.User, error) {
	var user models.User
	err := configs.DB.Where("email = ?", email).First(&user).Error
	return &user, err
}
