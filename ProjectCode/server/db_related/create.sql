CREATE TABLE users (
	user_id SERIAL PRIMARY KEY,
	username VARCHAR ( 50 ) UNIQUE NOT NULL,
	pw VARCHAR ( 50 ) NOT NULL,
	kd FLOAT(3) DEFAULT 0,
	accuracy FLOAT(3) DEFAULT 0
);
CREATE TABLE scores(
	score_id SERIAL PRIMARY KEY,
	score INT DEFAULT 0,
	user_id INT NOT NULL
);
