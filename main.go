package main

import (
	"log"
	"os"

	"github.com/MihirGharote/LetheCrypt/server"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Printf("Warning: Could not load .env file.")
	}

	value, found := os.LookupEnv("LETHECRYPT_JWT")
	if !found {
		log.Fatal("Provide a JWT key using the LETHECRYPT_JWT environment variable.")
	}
	if len(value) < 32 {
		log.Fatal("Invalid JWT Key. Ensure it is atleast 32 bytes long")
	}
	server.JWTSecret = []byte(value)

	value, found = os.LookupEnv("LETHECRYPT_AES")
	if !found {
		log.Fatal("Provide an AES Secret using the LETHECRYPT_AES environment variable.")
	}
	if len(value) != 32 {
		log.Fatal("Invalid AES Secret. Ensure it is exactly 32 bytes long")
	}
	server.AESSecret = []byte(value)

	value, found = os.LookupEnv("LETHECRYPT_DB_PATH")
	if !found {
		log.Fatal("Provide a path for the database using the LETHECRYPT_DB_PATH environment variable.")
	}
	server.DatabasePath = value

	server.InitializeDatabase()
	server.Route()
}
