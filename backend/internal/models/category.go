package models

import "time"

type Category struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"unique;not null" json:"name"`
	GroupName string    `gorm:"type:enum('Đồ nam','Đồ nữ','Đồ thể thao','Trẻ em','Phụ kiện');not null;default:'Đồ nam'" json:"group_name"`
	CreatedAt time.Time `json:"created_at"`

	Products []Product `gorm:"foreignKey:CategoryID"`
}
