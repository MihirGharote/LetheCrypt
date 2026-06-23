package server

import (
	"encoding/json"
	"net/http"
	"time"
)

func SignupHandler(w http.ResponseWriter, r *http.Request) {
	var creds Credentials

	w.Header().Set("Content-Type", "application/json")

	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	err := dec.Decode(&creds)

	if err != nil {
		MessageWithStatus(w, http.StatusBadRequest, "Cannot parse request body")
		return
	}

	message, status := Register(&creds)
	if message != "" {
		MessageWithStatus(w, status, message)
	} else {
		SetLoginCookie(w, creds.Username)
		EmptyStatus(w, http.StatusCreated)
	}
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	var creds Credentials

	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	err := dec.Decode(&creds)

	if err != nil {
		MessageWithStatus(w, http.StatusBadRequest, "Cannot parse request body")
		return
	}

	message, status := Authenticate(&creds)
	if status == http.StatusContinue {
		err = SetLoginCookie(w, creds.Username)
		if err != nil {
			MessageWithStatus(w, http.StatusInternalServerError, "Could not generate JWT")
			return
		}
		EmptyStatus(w, http.StatusOK)
	} else {
		MessageWithStatus(w, status, message)
	}
}

func IsAuthHandler(w http.ResponseWriter, r *http.Request) {
	res := false
	if IsUserAuthenticated(r) {
		res = true
	}
	json.NewEncoder(w).Encode(res)
}

func LogoutHandler(w http.ResponseWriter, r *http.Request) {
	if !IsUserAuthenticated(r) {
		NoAuthMessage(w)
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "auth_token",
		Value:    "",
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   -1,
		Expires:  time.Unix(0, 0),
	})

	EmptyStatus(w, http.StatusOK)
}
