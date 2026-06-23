package server

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

func GetAllPasswordsHandler(w http.ResponseWriter, r *http.Request) {
	found, username := ParseJWT(r)
	if !found {
		NoAuthMessage(w)
		return
	}

	passfiles := GetUserAndPasswordFiles(username).PasswordFiles
	json.NewEncoder(w).Encode(passfiles)
}

func CreatePasswordHandler(w http.ResponseWriter, r *http.Request) {
	found, username := ParseJWT(r)
	if !found {
		NoAuthMessage(w)
		return
	}

	var newPasswordFile PasswordFileEditables
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	err := dec.Decode(&newPasswordFile)

	if err != nil {
		MessageWithStatus(w, http.StatusBadRequest, "Cannot parse request body")
		return
	}
	ciphertext, err := EncryptPassword(newPasswordFile.Content)
	if err != nil {
		log.Printf("Could not encrypt password: %v\n", err)
		MessageWithStatus(w, http.StatusInternalServerError, "Could not encrypt password")
		return
	}
	AddPasswordFile(username, newPasswordFile.Name, ciphertext)
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{})
}

func GetOnePasswordHandler(w http.ResponseWriter, r *http.Request) {
	found, username := ParseJWT(r)
	if !found {
		NoAuthMessage(w)
		return
	}

	id, err := strconv.ParseUint(mux.Vars(r)["id"], 10, 64)
	if err != nil {
		MessageWithStatus(w, http.StatusBadRequest, "Provide a valid id")
		return
	}

	passfile, err := GetPasswordFile(username, id)
	if err != nil {
		var status int
		var message string
		if errors.Is(err, gorm.ErrRecordNotFound) {
			status = http.StatusNotFound
			message = "Record not found"
		} else {
			status = http.StatusInternalServerError
			message = "Database error"
		}
		MessageWithStatus(w, status, message)
		return
	}

	plaintextContent, err := DecryptPassword(passfile.Content)
	if err != nil {
		log.Printf("Could not decrypt password: %v\n", err)
		MessageWithStatus(w, http.StatusInternalServerError, "Could not decrypt password")
		return
	}
	passfileJSON := PasswordFileJSON{
		Author:           passfile.Author,
		Name:             passfile.Name,
		CreatedTimestamp: passfile.CreatedAt,
		ContentString:    plaintextContent,
		PasswordId:       passfile.ID,
	}
	json.NewEncoder(w).Encode(passfileJSON)
}

func PatchPasswordHandler(w http.ResponseWriter, r *http.Request) {
	found, username := ParseJWT(r)
	if !found {
		NoAuthMessage(w)
		return
	}

	var newPasswordFile PasswordFileEditables
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	err := dec.Decode(&newPasswordFile)
	if err != nil {
		MessageWithStatus(w, http.StatusBadRequest, "Cannot parse request body")
		return
	}

	id, err := strconv.ParseUint(mux.Vars(r)["id"], 10, 64)
	if err != nil {
		MessageWithStatus(w, http.StatusBadRequest, "Provide a valid id")
		return
	}

	err = UpdatePasswordFile(username, id, newPasswordFile.Name, []byte(newPasswordFile.Content))
	if err != nil {
		var status int
		var message string
		if errors.Is(err, gorm.ErrRecordNotFound) {
			status = http.StatusNotFound
			message = "Record not found"
		} else {
			status = http.StatusInternalServerError
			message = "Database error"
		}
		MessageWithStatus(w, status, message)
		return
	}

	EmptyStatus(w, http.StatusOK)
}

func DeletePasswordHandler(w http.ResponseWriter, r *http.Request) {
	found, username := ParseJWT(r)
	if !found {
		NoAuthMessage(w)
		return
	}

	id, err := strconv.ParseUint(mux.Vars(r)["id"], 10, 64)
	if err != nil {
		MessageWithStatus(w, http.StatusBadRequest, "Provide a valid id")
		return
	}

	err = DeletePasswordFile(username, id)
	if err != nil {
		var status int
		var message string
		if errors.Is(err, gorm.ErrRecordNotFound) {
			status = http.StatusNotFound
			message = "Record not found"
		} else {
			status = http.StatusInternalServerError
			message = "Database error"
		}

		MessageWithStatus(w, status, message)
		return
	}

	EmptyStatus(w, http.StatusNoContent)
}

func CopyPasswordHandler(w http.ResponseWriter, r *http.Request) {
	found, username := ParseJWT(r)
	if !found {
		NoAuthMessage(w)
		return
	}

	id, err := strconv.ParseUint(mux.Vars(r)["id"], 10, 64)
	if err != nil {
		MessageWithStatus(w, http.StatusBadRequest, "Provide a valid id")
		return
	}

	type receiver struct {
		Receiver string `json:"receiver"`
	}
	var rec receiver
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	err = dec.Decode(&rec)
	if err != nil || rec.Receiver == "" {
		MessageWithStatus(w, http.StatusBadRequest, "Cannot parse request body")
		return
	}

	err = CopyPasswordFile(username, id, rec.Receiver)
	if err != nil {
		var status int
		var message string
		if errors.Is(err, gorm.ErrRecordNotFound) {
			status = http.StatusNotFound
			message = "Record not found"
		} else if errors.Is(err, gorm.ErrInvalidField) {
			status = http.StatusBadRequest
			message = "Reciever does not exist"
		}
		MessageWithStatus(w, status, message)
		return
	}

	EmptyStatus(w, http.StatusCreated)
}
