import db from "./db";
import { createFollowUp } from "./followUps";

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

  follow_up_enabled: number;
  max_follow_ups: number;
  follow_up_wait_days: number;
  next_follow_up_id: number | null;
  next_follow_up_date: string | null;
  follow_up_count: number;
  planned_follow_up_count: number;
  sent_follow_up_count: number;
  cancelled_follow_up_count: number;

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
      SELECT
        applications.*,

        (
          SELECT follow_up_date
          FROM follow_ups
          WHERE follow_ups.application_id = applications.id
            AND follow_ups.status = 'Planned'
            AND applications.status NOT IN (
              'Rejected',
              'Withdrawn',
              'Offer'
            )
          ORDER BY follow_up_date ASC, id ASC
          LIMIT 1
        ) AS next_follow_up_date,

        (
          SELECT COUNT(*)
          FROM follow_ups
          WHERE follow_ups.application_id = applications.id
        ) AS follow_up_count,

        (
          SELECT COUNT(*)
          FROM follow_ups
          WHERE follow_ups.application_id = applications.id
            AND follow_ups.status = 'Sent'
        ) AS sent_follow_up_count,

        (
          SELECT COUNT(*)
          FROM follow_ups
          WHERE follow_ups.application_id = applications.id
            AND follow_ups.status = 'Planned'
            AND applications.status NOT IN (
              'Rejected',
              'Withdrawn',
              'Offer'
            )
        ) AS planned_follow_up_count,

        (
          SELECT COUNT(*)
          FROM follow_ups
          WHERE follow_ups.application_id = applications.id
            AND follow_ups.status = 'Cancelled'
        ) AS cancelled_follow_up_count

      FROM applications
      ORDER BY date_applied DESC
      `,
    )
    .all() as Application[];
}

export function getApplicationById(
  id: number,
): Application | undefined {
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
    interview_date: data.interview_date || null,
    interview_notes: data.interview_notes || null,
    contact_person: data.contact_person || null,
    contact_email: data.contact_email || null,
    notes: data.notes || null,
    resume_file: data.resume_file || null,
    cover_letter_file: data.cover_letter_file || null,
    job_description_file:
      data.job_description_file || null,
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
  contact_person?: string;
  contact_email?: string;
  resume_file: string | null;
  cover_letter_file: string | null;
  job_description_file: string | null;
  notes?: string;
}) {
  let contactEmail = data.contact_email?.trim() || null;

  // If no contact email was provided, look for an existing
  // application from the same company that already has an email.
  if (!contactEmail) {
    const existingContact = db
      .prepare(
        `
        SELECT contact_email
        FROM applications
        WHERE LOWER(TRIM(company)) = LOWER(TRIM(?))
          AND contact_email IS NOT NULL
          AND TRIM(contact_email) != ''
        ORDER BY id DESC
        LIMIT 1
        `,
      )
      .get(data.company) as
      | {
        contact_email: string;
      }
      | undefined;

    if (existingContact?.contact_email) {
      contactEmail = existingContact.contact_email;
    }
  }

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
      @contact_person,
      @contact_email,
      @notes,
      @resume_file,
      @cover_letter_file,
      @job_description_file
    )
  `);

  const result = statement.run({
    company: data.company,
    job_title: data.job_title,
    job_reference: data.job_reference || null,
    location: data.location || null,
    salary: data.salary || null,
    job_url: data.job_url || null,
    date_applied: data.date_applied,
    closing_date: data.closing_date || null,
    status: data.status || "Applied",
    contact_person: data.contact_person || null,
    contact_email: contactEmail,
    notes: data.notes || null,
    resume_file: data.resume_file || null,
    cover_letter_file: data.cover_letter_file || null,
    job_description_file:
      data.job_description_file || null,
  });

  const applicationId = Number(result.lastInsertRowid);

  const baseDate = data.closing_date || data.date_applied;

  const followUpDateResult = db
    .prepare(
      `
      WITH RECURSIVE business_days(
        candidate_date,
        business_days_added
      ) AS (
        SELECT
          date(?),
          0

        UNION ALL

        SELECT
          date(candidate_date, '+1 day'),
          business_days_added +
            CASE
              WHEN strftime(
                '%w',
                date(candidate_date, '+1 day')
              ) NOT IN ('0', '6')
              THEN 1
              ELSE 0
            END
        FROM business_days
        WHERE business_days_added < 3
      )
      SELECT candidate_date
      FROM business_days
      WHERE business_days_added = 3
      LIMIT 1
      `,
    )
    .get(baseDate) as {
      candidate_date: string;
    };

  createFollowUp({
    application_id: applicationId,
    follow_up_number: 1,
    follow_up_date:
      followUpDateResult.candidate_date,
    status: "Planned",
    response_status: "Waiting",
    notes: data.closing_date
      ? "Automatically planned 3 business days after closing date."
      : "Automatically planned 3 business days after application date.",
  });

  return result;
}


export type CompanySummary = {
  company: string;
  application_count: number;
  latest_application_date: string;
  latest_status: string;
  active_application_count: number;
  next_follow_up_date: string | null;
};

export function getCompanies(): CompanySummary[] {
  return db
    .prepare(
      `
      SELECT
        a1.company,

        COUNT(*) AS application_count,

        MAX(a1.date_applied) AS latest_application_date,

        (
          SELECT a2.status
          FROM applications a2
          WHERE LOWER(TRIM(a2.company)) =
                LOWER(TRIM(a1.company))
          ORDER BY a2.date_applied DESC, a2.id DESC
          LIMIT 1
        ) AS latest_status,

        SUM(
          CASE
            WHEN a1.status NOT IN (
              'Rejected',
              'Withdrawn',
              'Offer'
            )
            THEN 1
            ELSE 0
          END
        ) AS active_application_count,

        (
          SELECT MIN(f.follow_up_date)
          FROM follow_ups f
          JOIN applications a3
            ON a3.id = f.application_id
          WHERE LOWER(TRIM(a3.company)) =
                LOWER(TRIM(a1.company))
            AND f.status = 'Planned'
            AND a3.status NOT IN (
              'Rejected',
              'Withdrawn',
              'Offer'
            )
        ) AS next_follow_up_date

      FROM applications a1

      WHERE a1.company IS NOT NULL
        AND TRIM(a1.company) != ''

      GROUP BY LOWER(TRIM(a1.company))

      ORDER BY latest_application_date DESC
      `,
    )
    .all() as CompanySummary[];
}

export function getApplicationsByCompany(
  company: string,
): Application[] {
  return db
    .prepare(
      `
      SELECT
        applications.*,

   (
  SELECT id
  FROM follow_ups
  WHERE follow_ups.application_id = applications.id
    AND follow_ups.status = 'Planned'
    AND applications.status NOT IN (
      'Rejected',
      'Withdrawn',
      'Offer'
    )
  ORDER BY follow_up_date ASC, id ASC
  LIMIT 1
) AS next_follow_up_id,

(
  SELECT follow_up_date
  FROM follow_ups
  WHERE follow_ups.application_id = applications.id
    AND follow_ups.status = 'Planned'
    AND applications.status NOT IN (
      'Rejected',
      'Withdrawn',
      'Offer'
    )
  ORDER BY follow_up_date ASC, id ASC
  LIMIT 1
) AS next_follow_up_date,

        (
          SELECT COUNT(*)
          FROM follow_ups
          WHERE follow_ups.application_id = applications.id
        ) AS follow_up_count,

        (
          SELECT COUNT(*)
          FROM follow_ups
          WHERE follow_ups.application_id = applications.id
            AND follow_ups.status = 'Sent'
        ) AS sent_follow_up_count,

        (
          SELECT COUNT(*)
          FROM follow_ups
          WHERE follow_ups.application_id = applications.id
            AND follow_ups.status = 'Planned'
            AND applications.status NOT IN (
              'Rejected',
              'Withdrawn',
              'Offer'
            )
        ) AS planned_follow_up_count,

        (
          SELECT COUNT(*)
          FROM follow_ups
          WHERE follow_ups.application_id = applications.id
            AND follow_ups.status = 'Cancelled'
        ) AS cancelled_follow_up_count

      FROM applications

      WHERE LOWER(TRIM(company)) =
            LOWER(TRIM(?))

      ORDER BY date_applied DESC, id DESC
      `,
    )
    .all(company) as Application[];
}