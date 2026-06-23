package server

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"io"
	"log"
	"net/http"
	"regexp"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var JWTSecret []byte
var AESSecret []byte
var usernameRE = regexp.MustCompile(`^[\p{L}\p{N}_](?:[\p{L}\p{N}._-]{1,28})$`)

func Register(creds *Credentials) (message string, status int) {
	log.Printf("Registering user %s", creds.Username)
	if creds.Username == "" || creds.Password == "" {
		message = "Username and Password cannot be empty"
		status = http.StatusBadRequest
		return
	}
	if !usernameRE.MatchString(creds.Username) {
		message = "Invalid username"
		status = http.StatusBadRequest
		return
	}
	if DoesUserExist(creds.Username) {
		message = "The selected username is taken. Please try a different username"
		status = http.StatusConflict
		return
	}

	hashedPassword, err := hashPassword(creds.Password)
	if err != nil {
		message = "Failed to hash password"
		status = http.StatusInternalServerError
		return
	}
	AddUser(creds.Username, hashedPassword)
	status = http.StatusCreated
	return
}

func Authenticate(creds *Credentials) (message string, status int) {
	// Returns "", 100 if credentials match
	if creds.Username == "" || creds.Password == "" {
		message = "Username and Password cannot be empty"
		status = http.StatusBadRequest
		return
	}
	if !DoesUserExist(creds.Username) {
		message = "Invalid credentials"
		status = http.StatusUnauthorized
		return
	}
	user := GetUser(creds.Username)
	if checkPasswordCorrect(creds.Password, user.Password) {
		status = http.StatusContinue
		return
	}
	message = "Invalid credentials"
	status = http.StatusUnauthorized
	return
}

func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func checkPasswordCorrect(password string, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func GenerateJWT(username string) (string, error) {
	claims := jwt.MapClaims{
		"sub": username,
		"iat": time.Now().Unix(),
		"exp": time.Now().Add(24 * time.Hour).Unix(),
		"jti": randomID(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(JWTSecret)
}

func randomID() string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	return base64.RawURLEncoding.EncodeToString(b)
}

func ParseJWT(r *http.Request) (found bool, username string) {
	cookie, err := r.Cookie("auth_token")
	if err != nil {
		found = false
		return
	}

	token, err := jwt.Parse(cookie.Value, func(token *jwt.Token) (any, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrSignatureInvalid
		}
		return JWTSecret, nil
	})
	if err != nil || !token.Valid {
		found = false
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		found = false
		return
	}

	_, ok = claims["sub"].(string)
	if !ok {
		found = false
		return
	}
	found = true
	username = claims["sub"].(string)
	if !DoesUserExist(username) {
		found = false
		username = ""
		return
	}
	return
}

func IsUserAuthenticated(r *http.Request) bool {
	found, _ := ParseJWT(r)
	return found
}

func GetUsernameFromJWT(r *http.Request) string {
	_, username := ParseJWT(r)
	return username
}

func EncryptPassword(password string) ([]byte, error) {
	block, err := aes.NewCipher(AESSecret)
	if err != nil {
		return []byte{}, err
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return []byte{}, err
	}
	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return []byte{}, err
	}
	ciphertext := gcm.Seal(nil, nonce, []byte(password), nil)
	ciphertext = append(nonce, ciphertext...)
	return ciphertext, nil
}

func DecryptPassword(ciphertext []byte) (string, error) {
	block, err := aes.NewCipher(AESSecret)
	if err != nil {
		return "", err
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}
	nonceSize := gcm.NonceSize()
	if len(ciphertext) < nonceSize {
		return "", errors.New("ciphertext too short")
	}
	nonce, ciphertext := ciphertext[:nonceSize], ciphertext[nonceSize:]
	result, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return "", err
	}
	return string(result), nil
}
