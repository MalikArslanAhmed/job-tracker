import db from "./db";

db.exec(`
  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT NOT NULL,
    job_title TEXT NOT NULL,
    job_reference TEXT,
    location TEXT,
    salary TEXT,
    job_url TEXT,
    date_applied TEXT NOT NULL,
    closing_date TEXT,
    status TEXT NOT NULL DEFAULT 'Applied',
    follow_up_date TEXT,
    contact_person TEXT,
    contact_email TEXT,
    interview_date TEXT,
    interview_notes TEXT,
    resume_file TEXT,
    cover_letter_file TEXT,
    job_description_file TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS follow_ups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    application_id INTEGER NOT NULL,
    follow_up_date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Planned',
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
  );
`);

console.log("Database initialized");