package models

type OrderItem struct {
	ID        uint    `gorm:"primaryKey" json:"id"`
	OrderID   uint    `json:"order_id"`
	VariantID uint    `json:"variant_id"`
	Quantity  int     `json:"quantity"`
	Price     float64 `json:"price"`

	Order   Order          `gorm:"foreignKey:OrderID"`
	Variant ProductVariant `gorm:"foreignKey:VariantID"`
}
