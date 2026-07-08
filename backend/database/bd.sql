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

-- -- ==========================================
-- ENTERPRISE PROFILES
-- ==========================================

CREATE TABLE enterprise_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT UNIQUE NOT NULL,

    company_name VARCHAR(255),
    sector VARCHAR(255),
    website VARCHAR(255),
    phone VARCHAR(30),
    address VARCHAR(255),
    description TEXT,

    logo VARCHAR(255),

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- ==========================================
-- INTERNSHIPS
-- ==========================================

CREATE TABLE internships (
    id INT AUTO_INCREMENT PRIMARY KEY,

    enterprise_id INT NOT NULL,

    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,

    location VARCHAR(255),
    duration VARCHAR(100),

    salary VARCHAR(100),
    requirements TEXT,

    status ENUM('open', 'closed')
        DEFAULT 'open',

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (enterprise_id)
        REFERENCES enterprise_profiles(id)
        ON DELETE CASCADE
);

-- ==========================================
-- CV
-- ==========================================

CREATE TABLE cv (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    nom_fichier VARCHAR(255),
    chemin_fichier VARCHAR(255),
    date_upload DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ==========================================
-- POSTS
-- ==========================================

CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    content TEXT,
    image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ==========================================
-- POSTS COMMENTS
-- ==========================================

CREATE TABLE post_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ==========================================
-- POSTS LIKES
-- ==========================================

CREATE TABLE post_likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    reaction_type VARCHAR(20) DEFAULT 'like',
    UNIQUE KEY unique_like (post_id, user_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ==========================================
-- PARCOURS UNIVERSITAIRE
-- ==========================================

CREATE TABLE parcours_universitaire (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    universite VARCHAR(255),
    etablissement VARCHAR(255),
    specialite VARCHAR(255),
    date_entree DATE,
    date_sortie DATE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)