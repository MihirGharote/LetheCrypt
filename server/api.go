package server

import (
	"net/http"

	"github.com/gorilla/mux"
)

func RouteAPI(api *mux.Router) {
	api.Path("/health").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("ok"))
	})
	api.HandleFunc("/isauthenticated", IsAuthHandler).Methods("GET")
	api.HandleFunc("/signup", SignupHandler).Methods("POST")
	api.HandleFunc("/login", LoginHandler).Methods("POST")
	api.HandleFunc("/logout", LogoutHandler).Methods("GET")

	api.HandleFunc("/pass", GetAllPasswordsHandler).Methods("GET")
	api.HandleFunc("/pass", CreatePasswordHandler).Methods("POST")
	api.HandleFunc("/pass/{id}", GetOnePasswordHandler).Methods("GET")
	api.HandleFunc("/pass/{id}", PatchPasswordHandler).Methods("PATCH")
	api.HandleFunc("/pass/{id}", DeletePasswordHandler).Methods("DELETE")

	api.HandleFunc("/copy/{id}", CopyPasswordHandler).Methods("POST")

	api.NotFoundHandler = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte("404 not found"))
	})
}
