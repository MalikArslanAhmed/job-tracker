import db from "./db";

export type FollowUp = {
  id: number;
  application_id: number;
  follow_up_date: string;
  status: "Planned" | "Completed";
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
      ORDER BY follow_up_date DESC, id DESC
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
        AND follow_up_date >= date('now')
      ORDER BY follow_up_date ASC, id ASC
      LIMIT 1
      `,
    )
    .get(applicationId) as FollowUp | undefined;
}

export function createFollowUp(data: {
  application_id: number;
  follow_up_date: string;
  status?: "Planned" | "Completed";
  notes?: string;
}) {
  const statement = db.prepare(`
    INSERT INTO follow_ups (
      application_id,
      follow_up_date,
      status,
      notes
    )
    VALUES (
      @application_id,
      @follow_up_date,
      @status,
      @notes
    )
  `);

  return statement.run({
    application_id: data.application_id,
    follow_up_date: data.follow_up_date,
    status: data.status || "Planned",
    notes: data.notes || null,
  });
}

export function updateFollowUp(
  id: number,
  data: {
    follow_up_date: string;
    status: "Planned" | "Completed";
    notes?: string;
  },
) {
  const statement = db.prepare(`
    UPDATE follow_ups
    SET
      follow_up_date = @follow_up_date,
      status = @status,
      notes = @notes,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = @id
  `);

  return statement.run({
    id,
    follow_up_date: data.follow_up_date,
    status: data.status,
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
};

export function getDashboardFollowUps(): DashboardFollowUp[] {
  return db
    .prepare(
      `
      SELECT
        follow_ups.*,
        applications.company,
        applications.job_title,
        applications.status AS application_status
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