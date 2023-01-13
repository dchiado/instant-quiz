CREATE TABLE question (
  id SERIAL PRIMARY KEY,
  content VARCHAR ( 255 ) NOT NULL,
  is_multiple_choice BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT current_timestamp,
  updated_at TIMESTAMP DEFAULT current_timestamp
);

CREATE TABLE category (
  id SERIAL PRIMARY KEY,
  name VARCHAR ( 255 ) NOT NULL,
  created_at TIMESTAMP DEFAULT current_timestamp,
  updated_at TIMESTAMP DEFAULT current_timestamp
);

CREATE TABLE question_category (
  question_id INT NOT NULL,
  category_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT current_timestamp,
  updated_at TIMESTAMP DEFAULT current_timestamp,
  PRIMARY KEY (question_id, category_id),
  FOREIGN KEY (question_id)
      REFERENCES question (id),
  FOREIGN KEY (category_id)
      REFERENCES category (id)
);

CREATE TABLE answer (
  id SERIAL PRIMARY KEY,
  question_id INT NOT NULL,
  content VARCHAR ( 255 ) NOT NULL,
  correct BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT current_timestamp,
  updated_at TIMESTAMP DEFAULT current_timestamp,
  FOREIGN KEY (question_id)
      REFERENCES question (id)
);
