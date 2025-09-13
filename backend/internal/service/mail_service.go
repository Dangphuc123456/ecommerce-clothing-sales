package service

import (
	"fmt"
	"log"
	"net/smtp"
	"os"
)

func SendConfirmationEmail(toEmail, confirmLink string) error {
	from := os.Getenv("EMAIL_USER")
	pass := os.Getenv("EMAIL_PASS")
	host := os.Getenv("EMAIL_HOST")
	port := os.Getenv("EMAIL_PORT")

	auth := smtp.PlainAuth("", from, pass, host)

	subject := "Subject: ✅ Xác nhận đăng ký tài khoản\n"
	body := fmt.Sprintf(`<html>...<a href="%s">Xác nhận</a>...</html>`, confirmLink)

	msg := []byte("From: " + from + "\n" +
		"To: " + toEmail + "\n" +
		subject +
		"MIME-Version: 1.0;\nContent-Type: text/html; charset=\"UTF-8\";\n\n" + body)

	addr := fmt.Sprintf("%s:%s", host, port)
	err := smtp.SendMail(addr, auth, from, []string{toEmail}, msg)
	if err != nil {
		log.Println("Email error:", err)
		return err
	}
	return nil
}
