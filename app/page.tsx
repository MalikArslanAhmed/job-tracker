import Link from "next/link";
import {
  getDashboardFollowUps,
} from "@/lib/followUps";
import { getApplications } from "@/lib/applications";

export default function Home() {
  const applications = getApplications();
  const dashboardFollowUps = getDashboardFollowUps();

  const totalApplications = applications.length;

  const interviews = applications.filter(
    (application) =>
      application.status === "Interview" ||
      application.status === "Final Stage",
  ).length;

  const offers = applications.filter(
    (application) => application.status === "Offer",
  ).length;

  const totalPlannedFollowUps =
    dashboardFollowUps.filter(
      (followUp) => followUp.status === "Planned",
    ).length;

  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const todayString = formatDateKey(todayStart);

  const sevenDaysFromToday = formatDateKey(
    addDays(todayStart, 7),
  );

  const dueFollowUps = dashboardFollowUps.filter(
    (followUp) =>
      followUp.status === "Planned" &&
      followUp.follow_up_date <= todayString,
  );

  const upcomingFollowUps = dashboardFollowUps.filter(
    (followUp) =>
      followUp.status === "Planned" &&
      followUp.follow_up_date > todayString &&
      followUp.follow_up_date <= sevenDaysFromToday,
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-600">
            Track your UK job applications and progress.
          </p>
        </div>

        <Link
          href="/applications/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          + Add Application
        </Link>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Applications"
          value={totalApplications}
        />

        <StatCard
          label="Interviews"
          value={interviews}
        />

        <StatCard
          label="Offers"
          value={offers}
        />

        <StatCard
          label="Follow-ups"
          value={totalPlannedFollowUps}
        />
      </div>

      <div className="mt-8 rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Recent Applications
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your latest job applications.
            </p>
          </div>

          <Link
            href="/applications"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View all
          </Link>
        </div>

        {applications.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm text-slate-500">
              No applications yet.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {applications.slice(0, 5).map((application) => (
              <Link
                key={application.id}
                href={`/applications/${application.id}`}
                className="flex items-center justify-between px-6 py-4 transition hover:bg-slate-50"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {application.job_title}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {application.company}
                  </p>
                </div>

                <div className="text-right">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {application.status}
                  </span>

                  <p className="mt-2 text-xs text-slate-400">
                    {new Date(
                      application.date_applied,
                    ).toLocaleDateString("en-GB")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <DashboardFollowUpSection
        title="Follow-ups Due"
        description="Overdue or due today."
        followUps={dueFollowUps}
        today={todayStart}
        emptyMessage="No follow-ups due."
      />

      <DashboardFollowUpSection
        title="Upcoming Follow-ups"
        description="Planned follow-ups for the next 7 days."
        followUps={upcomingFollowUps}
        today={todayStart}
        emptyMessage="No upcoming follow-ups."
      />
    </div>
  );
}

function DashboardFollowUpSection({
  title,
  description,
  followUps,
  today,
  emptyMessage,
}: {
  title: string;
  description: string;
  followUps: {
    id: number;
    application_id: number;
    follow_up_number: number;
    follow_up_date: string;
    status: "Planned" | "Sent" | "Cancelled";
    response_status: "Waiting" | "Received" | "No Response";
    sent_at: string | null;
    responded_at: string | null;
    email_to: string | null;
    email_subject: string | null;
    email_message: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    company: string;
    job_title: string;
    application_status: string;
    contact_email: string | null;
  }[];
  today: Date;
  emptyMessage: string;
}) {
  return (
    <div className="mt-8 rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-slate-900">
          {title}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>

      {followUps.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-sm text-slate-500">
            {emptyMessage}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {followUps.map((followUp) => (
            <DashboardFollowUpRow
              key={followUp.id}
              followUp={followUp}
              today={today}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DashboardFollowUpRow({
  followUp,
  today,
}: {
  followUp: {
    id: number;
    application_id: number;
    follow_up_number: number;
    follow_up_date: string;
    status: "Planned" | "Sent" | "Cancelled";
    response_status: "Waiting" | "Received" | "No Response";
    sent_at: string | null;
    responded_at: string | null;
    email_to: string | null;
    email_subject: string | null;
    email_message: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    company: string;
    job_title: string;
    application_status: string;
  };
  today: Date;
}) {
  const followUpDate = new Date(
    `${followUp.follow_up_date}T00:00:00`,
  );

  const differenceMs =
    followUpDate.getTime() - today.getTime();

  const differenceDays = Math.round(
    differenceMs / (1000 * 60 * 60 * 24),
  );

  let timingLabel = "";
  let timingClass = "";

  if (differenceDays < 0) {
    const daysOverdue = Math.abs(differenceDays);

    timingLabel =
      daysOverdue === 1
        ? "Overdue by 1 day"
        : `Overdue by ${daysOverdue} days`;

    timingClass = "bg-red-50 text-red-700";
  } else if (differenceDays === 0) {
    timingLabel = "Due today";
    timingClass = "bg-amber-50 text-amber-700";
  } else if (differenceDays === 1) {
    timingLabel = "Tomorrow";
    timingClass = "bg-amber-50 text-amber-700";
  } else {
    timingLabel = `In ${differenceDays} days`;
    timingClass = "bg-emerald-50 text-emerald-700";
  }

  return (
    <Link
      href={`/applications/${followUp.application_id}`}
      className="flex items-center justify-between gap-6 px-6 py-4 transition hover:bg-slate-50"
    >
      <div className="min-w-0">
        <p className="font-medium text-slate-900">
          {followUp.job_title}
        </p>

        <p className="mt-1 text-sm text-slate-500">
          {followUp.company}
        </p>

        {followUp.notes && (
          <p className="mt-2 truncate text-xs text-slate-400">
            {followUp.notes}
          </p>
        )}
      </div>

      <div className="shrink-0 text-right">
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${timingClass}`}
        >
          {timingLabel}
        </span>

        <p className="mt-2 text-xs text-slate-500">
          {new Date(
            `${followUp.follow_up_date}T00:00:00`,
          ).toLocaleDateString("en-GB")}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          {followUp.application_status}
        </p>
      </div>
    </Link>
  );
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");
  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <p className="text-sm font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}