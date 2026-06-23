package server

import (
	"encoding/json"
	"net/http"
	"time"
)

func SetLoginCookie(w http.ResponseWriter, username string) error {
	token, err := GenerateJWT(username)
	if err != nil {
		return err
	}
	http.SetCookie(w, &http.Cookie{
		Name:     "auth_token",
		Value:    token,
		HttpOnly: true,
		Secure:   false, // https is not required
		SameSite: http.SameSiteLaxMode,
		Expires:  time.Now().Add(24 * time.Hour),
		MaxAge:   24 * 60 * 60,
	})
	return nil
}

func MessageWithStatus(w http.ResponseWriter, statusCode int, message string) {
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(map[string]string{"message": message})
}

func EmptyStatus(w http.ResponseWriter, statusCode int) {
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(map[string]string{})
}

func NoAuthMessage(w http.ResponseWriter) {
	MessageWithStatus(w, http.StatusUnauthorized, "Not authenticated")
}
