CREATE DATABASE IF NOT EXISTS rice_disease_db;
USE rice_disease_db;

-- USER entity (from ERD)
CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  username VARCHAR(80) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('Farmer','Technician','IT Expert','Admin') NOT NULL DEFAULT 'Farmer',
  contact_number VARCHAR(30),
  barangay VARCHAR(100),
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DISEASE entity (from ERD)
CREATE TABLE IF NOT EXISTS diseases (
  disease_id INT AUTO_INCREMENT PRIMARY KEY,
  disease_name VARCHAR(120) NOT NULL UNIQUE,
  category ENUM('Fungal','Bacterial','Viral','Insect Pest','Healthy') NOT NULL,
  description TEXT,
  glcm_feature_profile TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DETECTION_RECORD entity (from ERD)
CREATE TABLE IF NOT EXISTS detection_records (
  detection_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  image_path VARCHAR(255) NOT NULL,
  disease_id INT,
  date_captured DATETIME NOT NULL,
  gps_location VARCHAR(120),
  confidence_score DECIMAL(5,2) DEFAULT 0.00,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (disease_id) REFERENCES diseases(disease_id) ON DELETE SET NULL
);

-- RECOMMENDATION entity (from ERD)
CREATE TABLE IF NOT EXISTS recommendations (
  recommendation_id INT AUTO_INCREMENT PRIMARY KEY,
  disease_id INT NOT NULL,
  treatment_text TEXT NOT NULL,
  pesticide_fertilizer_guide TEXT,
  source_reference VARCHAR(255),
  FOREIGN KEY (disease_id) REFERENCES diseases(disease_id) ON DELETE CASCADE
);

-- EVALUATION_RESPONSE entity (from ERD)
CREATE TABLE IF NOT EXISTS evaluation_responses (
  response_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  evaluation_criterion VARCHAR(120) NOT NULL,
  rating_score TINYINT NOT NULL CHECK (rating_score BETWEEN 1 AND 5),
  date_submitted DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Seed default admin account (username: admin / password: admin123)
INSERT INTO users (full_name, username, password_hash, role)
SELECT 'System Administrator', 'admin',
'$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Admin'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username='admin');

-- Seed diseases per manuscript scope (Chapter I – Scope & Delimitation)
INSERT IGNORE INTO diseases (disease_name, category, description) VALUES
('Rice Blast','Fungal','Caused by Magnaporthe oryzae. Diamond-shaped lesions with gray centers and brown borders.'),
('Brown Spot','Fungal','Caused by Bipolaris oryzicola. Small oval-to-circular brown lesions with yellow halos.'),
('Sheath Blight','Fungal','Caused by Rhizoctonia solani. Irregular greenish-gray lesions with brown borders.'),
('Narrow Brown Leaf Spot','Fungal','Caused by Cercospora janseana. Short narrow reddish-brown streaks parallel to veins.'),
('Leaf Smut','Fungal','Caused by Entyloma oryzae. Small angular black spots on leaves.'),
('Bacterial Leaf Blight','Bacterial','Caused by Xanthomonas oryzae pv. oryzae. Yellowing lesions along leaf margins.'),
('Bacterial Leaf Streak','Bacterial','Caused by Xanthomonas oryzae pv. oryzicola. Water-soaked translucent streaks between veins.'),
('Rice Tungro','Viral','Transmitted by green leafhopper. Yellow-orange discoloration and stunted growth.'),
('Stem Borer','Insect Pest','Larval pest that bores into rice stems causing deadhearts.'),
('Brown Planthopper','Insect Pest','Sucking insect that causes hopperburn and viral transmission.'),
('Leaf Folder','Insect Pest','Larvae fold and feed on leaves causing white streaks.'),
('Healthy','Healthy','No disease or pest detected.');