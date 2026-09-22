import db from "./db";

export type FollowUpStatus =
  | "Planned"
  | "Sent"
  | "Cancelled";

export type ResponseStatus =
  | "Waiting"
  | "Received"
  | "No Response";

export type FollowUp = {
  id: number;
  application_id: number;
  follow_up_number: number;
  follow_up_date: string;
  status: FollowUpStatus;
  response_status: ResponseStatus;
  sent_at: string | null;
  responded_at: string | null;
  email_to: string | null;
  email_subject: string | null;
  email_message: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export function getFollowUpsByApplicationId(
  applicationId: number,
): FollowUp[] {
  return db
    .prepare(
      `
      SELECT *
      FROM follow_ups
      WHERE application_id = ?
      ORDER BY follow_up_number ASC, id ASC
      `,
    )
    .all(applicationId) as FollowUp[];
}

export function getNextPlannedFollowUp(
  applicationId: number,
): FollowUp | undefined {
  return db
    .prepare(
      `
      SELECT *
      FROM follow_ups
      WHERE application_id = ?
        AND status = 'Planned'
      ORDER BY follow_up_date ASC, id ASC
      LIMIT 1
      `,
    )
    .get(applicationId) as FollowUp | undefined;
}

export function createFollowUp(data: {
  application_id: number;
  follow_up_date: string;
  follow_up_number?: number;
  status?: FollowUpStatus;
  response_status?: ResponseStatus;
  email_to?: string | null;
  email_subject?: string | null;
  email_message?: string | null;
  notes?: string;
}) {
  const statement = db.prepare(`
    INSERT INTO follow_ups (
      application_id,
      follow_up_number,
      follow_up_date,
      status,
      response_status,
      email_to,
      email_subject,
      email_message,
      notes
    )
    VALUES (
      @application_id,
      @follow_up_number,
      @follow_up_date,
      @status,
      @response_status,
      @email_to,
      @email_subject,
      @email_message,
      @notes
    )
  `);

  return statement.run({
    application_id: data.application_id,
    follow_up_number: data.follow_up_number || 1,
    follow_up_date: data.follow_up_date,
    status: data.status || "Planned",
    response_status: data.response_status || "Waiting",
    email_to: data.email_to || null,
    email_subject: data.email_subject || null,
    email_message: data.email_message || null,
    notes: data.notes || null,
  });
}

export function markFollowUpSent(
  id: number,
  data?: {
    email_to?: string | null;
    email_subject?: string | null;
    email_message?: string | null;
  },
) {
  const statement = db.prepare(`
    UPDATE follow_ups
    SET
      status = 'Sent',
      sent_at = CURRENT_TIMESTAMP,
      email_to = @email_to,
      email_subject = @email_subject,
      email_message = @email_message,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = @id
  `);

  return statement.run({
    id,
    email_to: data?.email_to || null,
    email_subject: data?.email_subject || null,
    email_message: data?.email_message || null,
  });
}

export function markFollowUpResponseReceived(id: number) {
  const statement = db.prepare(`
    UPDATE follow_ups
    SET
      response_status = 'Received',
      responded_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = @id
  `);

  return statement.run({ id });
}

export function markFollowUpNoResponse(id: number) {
  const statement = db.prepare(`
    UPDATE follow_ups
    SET
      response_status = 'No Response',
      updated_at = CURRENT_TIMESTAMP
    WHERE id = @id
  `);

  return statement.run({ id });
}

export function cancelFollowUp(id: number) {
  const statement = db.prepare(`
    UPDATE follow_ups
    SET
      status = 'Cancelled',
      updated_at = CURRENT_TIMESTAMP
    WHERE id = @id
  `);

  return statement.run({ id });
}

export function updateFollowUp(
  id: number,
  data: {
    follow_up_date: string;
    status: FollowUpStatus;
    response_status: ResponseStatus;
    notes?: string;
  },
) {
  const statement = db.prepare(`
    UPDATE follow_ups
    SET
      follow_up_date = @follow_up_date,
      status = @status,
      response_status = @response_status,
      notes = @notes,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = @id
  `);

  return statement.run({
    id,
    follow_up_date: data.follow_up_date,
    status: data.status,
    response_status: data.response_status,
    notes: data.notes || null,
  });
}

export function deleteFollowUp(id: number) {
  return db
    .prepare(
      `
      DELETE FROM follow_ups
      WHERE id = ?
      `,
    )
    .run(id);
}

export type DashboardFollowUp = FollowUp & {
  company: string;
  job_title: string;
  application_status: string;
  contact_email: string | null;
};

export function getDashboardFollowUps(): DashboardFollowUp[] {
  return db
    .prepare(
      `
      SELECT
        follow_ups.*,
        applications.company,
        applications.job_title,
        applications.status AS application_status,
        applications.contact_email
      FROM follow_ups
      INNER JOIN applications
        ON applications.id = follow_ups.application_id
      WHERE applications.status NOT IN (
        'Rejected',
        'Withdrawn',
        'Offer'
      )
      ORDER BY
        follow_ups.follow_up_date ASC,
        follow_ups.id ASC
      `,
    )
    .all() as DashboardFollowUp[];
}
