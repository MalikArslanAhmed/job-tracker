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
  )
`);

console.log("Database initialized");