import db from "./db";

export type Application = {
  id: number;
  company: string;
  job_title: string;
  job_reference: string | null;
  location: string | null;
  salary: string | null;
  job_url: string | null;
  date_applied: string;
  closing_date: string | null;
  status: string;
  follow_up_date: string | null;
  interview_date: string | null;
  interview_notes: string | null;
  contact_person: string | null;
  contact_email: string | null;
  resume_file: string | null;
  cover_letter_file: string | null;
  job_description_file: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export function getApplications(): Application[] {
  return db
    .prepare(
      `
      SELECT *
      FROM applications
      ORDER BY date_applied DESC
      `,
    )
    .all() as Application[];
}

export function getApplicationById(id: number): Application | undefined {
  return db
    .prepare(
      `
      SELECT *
      FROM applications
      WHERE id = ?
      `,
    )
    .get(id) as Application | undefined;
}

export function updateApplication(
  id: number,
  data: {
    company: string;
    job_title: string;
    job_reference?: string;
    location?: string;
    salary?: string;
    job_url?: string;
    date_applied: string;
    closing_date?: string;
    status?: string;
    follow_up_date?: string;
    interview_date: string | null;
    interview_notes: string | null;
    contact_person?: string | null;
    contact_email?: string | null;
    notes?: string;
    resume_file?: string | null;
    cover_letter_file?: string | null;
    job_description_file?: string | null;
  },
) {
  const statement = db.prepare(`
    UPDATE applications
    SET
      company = @company,
      job_title = @job_title,
      job_reference = @job_reference,
      location = @location,
      salary = @salary,
      job_url = @job_url,
      date_applied = @date_applied,
      closing_date = @closing_date,
      status = @status,
      follow_up_date = @follow_up_date,
interview_date = @interview_date,
interview_notes = @interview_notes,
contact_person = @contact_person,
contact_email = @contact_email,
notes = @notes,
      resume_file = @resume_file,
cover_letter_file = @cover_letter_file,
job_description_file = @job_description_file,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = @id
  `);

  return statement.run({
    id,
    company: data.company,
    job_title: data.job_title,
    job_reference: data.job_reference || null,
    location: data.location || null,
    salary: data.salary || null,
    job_url: data.job_url || null,
    date_applied: data.date_applied,
    closing_date: data.closing_date || null,
    status: data.status || "Applied",
    follow_up_date: data.follow_up_date || null,
    interview_date: data.interview_date || null,
    interview_notes: data.interview_notes || null,
    contact_person: data.contact_person || null,
    contact_email: data.contact_email || null,
    notes: data.notes || null,
    resume_file: data.resume_file || null,
    cover_letter_file: data.cover_letter_file || null,
    job_description_file: data.job_description_file || null,
  });
}

export function createApplication(data: {
  company: string;
  job_title: string;
  job_reference?: string;
  location?: string;
  salary?: string;
  job_url?: string;
  date_applied: string;
  closing_date?: string;
  status?: string;
  follow_up_date?: string;
  contact_person?: string;
  contact_email?: string;
  resume_file: string | null;
  cover_letter_file: string | null;
  job_description_file: string | null;
  notes?: string;
}) {
  const statement = db.prepare(`
    INSERT INTO applications (
      company,
      job_title,
      job_reference,
      location,
      salary,
      job_url,
      date_applied,
      closing_date,
      status,
      follow_up_date,
      contact_person,
      contact_email,
      notes,
      resume_file,
      cover_letter_file,
      job_description_file
    )
    VALUES (
      @company,
      @job_title,
      @job_reference,
      @location,
      @salary,
      @job_url,
      @date_applied,
      @closing_date,
      @status,
      @follow_up_date,
      @contact_person,
      @contact_email,
      @notes,
      @resume_file,
      @cover_letter_file,
      @job_description_file
    )
  `);

  return statement.run({
    company: data.company,
    job_title: data.job_title,
    job_reference: data.job_reference || null,
    location: data.location || null,
    salary: data.salary || null,
    job_url: data.job_url || null,
    date_applied: data.date_applied,
    closing_date: data.closing_date || null,
    status: data.status || "Applied",
    follow_up_date: data.follow_up_date || null,
    contact_person: data.contact_person || null,
    contact_email: data.contact_email || null,
    notes: data.notes || null,
    resume_file: data.resume_file || null,
    cover_letter_file: data.cover_letter_file || null,
    job_description_file: data.job_description_file || null,
  });
}