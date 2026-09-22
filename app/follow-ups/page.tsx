import Link from "next/link";
import { getDashboardFollowUps } from "@/lib/followUps";
import SendFollowUpButton from "./SendFollowUpButton";
import SendDueFollowUpsButton from "./SendDueFollowUpsButton";

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getToday() {
  const today = new Date();

  return `${today.getFullYear()}-${String(
    today.getMonth() + 1,
  ).padStart(2, "0")}-${String(
    today.getDate(),
  ).padStart(2, "0")}`;
}

export default function FollowUpsPage() {
  const followUps = getDashboardFollowUps();

  const today = getToday();

  const dueFollowUps = followUps.filter(
    (followUp) =>
      followUp.status === "Planned" &&
      followUp.follow_up_date <= today,
  );

  const upcomingFollowUps = followUps.filter(
    (followUp) =>
      followUp.status === "Planned" &&
      followUp.follow_up_date > today,
  );

  const overdueFollowUps = dueFollowUps.filter(
    (followUp) =>
      followUp.follow_up_date < today,
  );

  const dueTodayFollowUps = dueFollowUps.filter(
    (followUp) =>
      followUp.follow_up_date === today,
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Follow-ups
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Review and send your planned job application
            follow-ups.
          </p>
        </div>

        <div className="flex gap-3">
          <SendDueFollowUpsButton />
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm font-medium text-red-700">
            Overdue
          </p>

          <p className="mt-2 text-3xl font-bold text-red-900">
            {overdueFollowUps.length}
          </p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-medium text-amber-700">
            Due Today
          </p>

          <p className="mt-2 text-3xl font-bold text-amber-900">
            {dueTodayFollowUps.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-600">
            Upcoming
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {upcomingFollowUps.length}
          </p>
        </div>
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Due Follow-ups
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Follow-ups that are due today or overdue.
            </p>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {dueFollowUps.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No follow-ups are due.
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {dueFollowUps.map((followUp) => (
                <div
                  key={followUp.id}
                  className="flex flex-wrap items-center justify-between gap-4 p-5"
                >
                  <div>
                    <Link
                      href={`/applications/${followUp.application_id}`}
                      className="font-semibold text-slate-900 hover:text-slate-600"
                    >
                      {followUp.company}
                    </Link>

                    <p className="mt-1 text-sm text-slate-600">
                      {followUp.job_title}
                    </p>

                    <p className="mt-2 text-sm">
                      <span className="font-medium text-slate-700">
                        Follow-up #{followUp.follow_up_number}
                      </span>

                      <span className="ml-3 text-slate-500">
                        {formatDate(
                          followUp.follow_up_date,
                        )}
                      </span>
                    </p>

                    <p
                      className={`mt-1 text-sm font-medium ${followUp.follow_up_date < today
                        ? "text-red-600"
                        : "text-amber-600"
                        }`}
                    >
                      {followUp.follow_up_date < today
                        ? "Overdue"
                        : "Due today"}
                    </p>
                  </div>

                  <SendFollowUpButton followUpId={followUp.id} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900">
          Upcoming Follow-ups
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Future follow-ups that are currently scheduled.
        </p>

        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {upcomingFollowUps.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No upcoming follow-ups.
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {upcomingFollowUps.map((followUp) => (
                <div
                  key={followUp.id}
                  className="flex flex-wrap items-center justify-between gap-4 p-5"
                >
                  <div>
                    <Link
                      href={`/applications/${followUp.application_id}`}
                      className="font-semibold text-slate-900 hover:text-slate-600"
                    >
                      {followUp.company}
                    </Link>

                    <p className="mt-1 text-sm text-slate-600">
                      {followUp.job_title}
                    </p>

                    <p className="mt-2 text-sm text-slate-500">
                      Follow-up #{followUp.follow_up_number}
                      {" · "}
                      {formatDate(
                        followUp.follow_up_date,
                      )}
                    </p>
                  </div>

                  <SendFollowUpButton followUpId={followUp.id} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}