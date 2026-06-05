CREATE DATABASE forsa_campus;

USE forsa_campus;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100),
    prenom VARCHAR(100),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    role ENUM('etudiant', 'entreprise', 'admin'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);