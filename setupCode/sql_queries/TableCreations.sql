CREATE TABLE student_users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    calendar_start TIMESTAMP,
    calendar_end TIMESTAMP
);


CREATE TABLE club_users (
    id SERIAL PRIMARY KEY,
    club_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE clubs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    about TEXT,
    logo_url TEXT,
    contact_email VARCHAR(255),
    officers JSONB DEFAULT '[]', -- Stores a simple array of names: ["Name 1", "Name 2"]
    instagram_url TEXT,
    website_url TEXT,
    twitter_url TEXT
);


ALTER TABLE clubs 
ADD COLUMN owner_id INTEGER REFERENCES club_users(id) ON DELETE SET NULL;


UPDATE clubs
SET owner_id = club_users.id
FROM club_users
WHERE clubs.name = club_users.club_name;


CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    club_id INTEGER REFERENCES clubs(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    description TEXT
);


CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    tag_name VARCHAR(50) UNIQUE NOT NULL
);


CREATE TABLE club_tags (
    club_id INTEGER REFERENCES clubs(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (club_id, tag_id)
);


ALTER TABLE tags ADD CONSTRAINT unique_tag_name UNIQUE (tag_name);


CREATE TABLE student_favorite_clubs (
    student_id INTEGER REFERENCES student_users(id) ON DELETE CASCADE,
    club_id INTEGER REFERENCES clubs(id) ON DELETE CASCADE,
    PRIMARY KEY (student_id, club_id)
);


-- Table for event attendance
CREATE TABLE student_event_attendance (
    student_id INTEGER REFERENCES student_users(id) ON DELETE CASCADE,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    PRIMARY KEY (student_id, event_id)
);


ALTER TABLE student_event_attendance 
ADD CONSTRAINT unique_student_event UNIQUE (student_id, event_id);



ALTER TABLE club_tags ADD CONSTRAINT unique_club_tag UNIQUE (club_id, tag_id);