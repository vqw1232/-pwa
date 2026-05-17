-- Run this in Azure SQL Database (e.g. via Azure Data Studio or SSMS)
-- Creates users and user_progress tables

CREATE TABLE users (
  id INT IDENTITY(1,1) PRIMARY KEY,
  username NVARCHAR(50) NOT NULL UNIQUE,
  password_hash NVARCHAR(255) NOT NULL,
  created_at DATETIME2 DEFAULT GETDATE()
);

CREATE TABLE user_progress (
  id BIGINT IDENTITY(1,1) PRIMARY KEY,
  user_id INT NOT NULL,
  word_id INT NOT NULL,
  correct_count INT DEFAULT 0,
  wrong_count INT DEFAULT 0,
  last_reviewed_at DATETIME2 DEFAULT GETDATE(),
  UNIQUE(user_id, word_id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
