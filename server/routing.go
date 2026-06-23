package server

import (
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gorilla/mux"
)

const DISTDIR = "./client/dist"
const PORT = ":8000"

func Route() {
	r := mux.NewRouter()

	api := r.PathPrefix("/api").Subrouter()
	RouteAPI(api)

	r.PathPrefix("/assets/").HandlerFunc(serveWrapper("/assets"))
	r.PathPrefix("/").HandlerFunc(serveWrapper(""))

	r.NotFoundHandler = http.HandlerFunc(notFoundHandler)

	log.Printf("Serving on %s", PORT)
	log.Fatal(http.ListenAndServe(PORT, r))
}

func notFoundHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("404 Not Found: ", r.URL.Path)
	w.WriteHeader(http.StatusNotFound)
	http.ServeFile(w, r, filepath.Join(DISTDIR, "notFound.html"))
}

func serveWrapper(prefix string) func(http.ResponseWriter, *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		rel := filepath.Clean(strings.TrimPrefix(r.URL.Path, prefix))
		if filepath.Ext(rel) == "" && rel != "/" {
			rel += ".html"
		}

		fullPath := filepath.Join(DISTDIR, prefix, rel)
		info, err := os.Stat(fullPath)
		if err != nil || (rel != "/" && info.IsDir()) {
			notFoundHandler(w, r)
			return
		}

		log.Println("200 OK: ", rel)
		http.ServeFile(w, r, fullPath)
	}
}
