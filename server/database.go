package server

import (
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var db *gorm.DB
var DatabasePath string

func InitializeDatabase() {
	var err error
	db, err = gorm.Open(sqlite.Open(DatabasePath), &gorm.Config{})

	if err != nil {
		panic("Database connection failed")
	}

	db.AutoMigrate(&User{}, &PasswordFile{})
}

func AddUser(username, password string) {
	db.Create(&User{
		Username: username,
		Password: password,
	})
}

func AddPasswordFile(username string, name string, content []byte) {
	user := GetUser(username)
	db.Model(&user).Association("PasswordFiles").Append(&PasswordFile{
		Author:  username,
		Name:    name,
		Content: content,
	})
}

func GetPasswordFile(username string, id uint64) (passfile PasswordFile, err error) {
	user := GetUser(username)
	err = db.Model(&PasswordFile{}).Where("user_id = ? AND id = ?", user.ID, id).First(&passfile).Error
	return
}

func DeletePasswordFile(username string, id uint64) (err error) {
	user := GetUser(username)
	var passfile PasswordFile
	err = db.Model(&PasswordFile{}).Where("user_id = ? AND id = ?", user.ID, id).First(&passfile).Error
	if err != nil {
		return
	}
	db.Delete(&passfile, &passfile)
	return nil
}

func UpdatePasswordFile(username string, id uint64, name string, content []byte) (err error) {
	user := GetUser(username)
	var passfile PasswordFile
	err = db.Model(&PasswordFile{}).Where("user_id = ? AND id = ?", user.ID, id).First(&passfile).Error
	if err != nil {
		return
	}
	if name != "" {
		db.Model(&passfile).Updates(PasswordFile{Name: name})
	}
	if len(content) > 0 {
		db.Model(&passfile).Updates(PasswordFile{Content: content})
	}
	return nil
}

func CopyPasswordFile(username string, id uint64, receiver string) error {
	passfile, err := GetPasswordFile(username, id)
	if err != nil {
		return err
	}
	if !DoesUserExist(receiver) {
		return gorm.ErrInvalidField
	}
	receiverUser := GetUser(receiver)
	db.Model(&receiverUser).Association("PasswordFiles").Append(&PasswordFile{
		Author:    passfile.Author,
		Name:      passfile.Name,
		CreatedAt: passfile.CreatedAt,
		Content:   passfile.Content,
	})
	return nil
}

func GetUser(username string) (user User) {
	db.Model(&User{}).Where("username = ?", username).First(&user)
	return
}

func GetUserAndPasswordFiles(username string) (user User) {
	db.Preload("PasswordFiles").Model(&User{}).Where("username = ?", username).First(&user)
	return
}

func DoesUserExist(username string) bool {
	var count int64
	db.Model(&User{}).Where("username = ?", username).Count(&count)
	return count > 0
}
