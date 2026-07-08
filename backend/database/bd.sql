CREATE DATABASE forsa_campus;
USE forsa_campus;

-- USERS TABLE
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100),
    prenom VARCHAR(100),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    role ENUM('etudiant', 'entreprise', 'admin'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reset_token VARCHAR(255),
    reset_token_expiry DATETIME
);

-- STUDENT PROFILE
CREATE TABLE student_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE,
    university VARCHAR(255),
    degree VARCHAR(255),
    field_of_study VARCHAR(255),
    graduation_year VARCHAR(10),
    phone VARCHAR(30),
    bio TEXT,

    -- NEW: student photo
    photo VARCHAR(255),

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ENTERPRISE PROFILE
CREATE TABLE enterprise_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE,
    company_name VARCHAR(255),
    sector VARCHAR(255),
    website VARCHAR(255),
    phone VARCHAR(30),
    address VARCHAR(255),
    description TEXT,

    -- NEW: company logo
    logo VARCHAR(255),

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);