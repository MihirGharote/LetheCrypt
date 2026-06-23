package server

import (
	"time"

	"gorm.io/gorm"
)

type Credentials struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type PasswordFileEditables struct {
	Content string `json:"content"`
	Name    string `json:"name"`
}

type PasswordFileJSON struct {
	Author           string    `json:"author"`
	Name             string    `json:"name"`
	ContentString    string    `json:"content"`
	CreatedTimestamp time.Time `json:"createdTimestamp"`
	PasswordId       uint64    `json:"passwordID"`
}

type PasswordFile struct {
	gorm.Model `json:"-"`
	ID         uint64    `json:"passwordID"`
	UserID     uint      `json:"-"`
	Author     string    `json:"author"`
	Name       string    `json:"name"`
	CreatedAt  time.Time `json:"createdTimestamp"`
	Content    []byte    `json:"-"`
}

type User struct {
	gorm.Model
	Username      string
	Password      string
	PasswordFiles []PasswordFile
}
