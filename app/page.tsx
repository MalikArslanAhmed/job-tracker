import Link from "next/link";
import { getApplications } from "@/lib/applications";

export default function Home() {
  const applications = getApplications();

  const totalApplications = applications.length;

  const interviews = applications.filter(
    (application) =>
      application.status === "Interview" ||
      application.status === "Final Stage",
  ).length;

  const offers = applications.filter(
    (application) => application.status === "Offer",
  ).length;

  const today = new Date().toISOString().split("T")[0];

  const followUps = applications.filter(
    (application) =>
      application.next_follow_up_date &&
      application.next_follow_up_date <= today &&
      application.status !== "Rejected" &&
      application.status !== "Withdrawn" &&
      application.status !== "Offer",
  ).length;

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
          value={followUps}
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
      <div className="mt-8 rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Follow-ups Due
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Applications that need a follow-up today or are overdue.
          </p>
        </div>

        {applications.filter(
          (application) =>
            application.next_follow_up_date &&
            application.next_follow_up_date <= today &&
            application.status !== "Rejected" &&
            application.status !== "Withdrawn" &&
            application.status !== "Offer",
        ).length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm text-slate-500">
              No follow-ups due.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {applications
              .filter(
                (application) =>
                  application.next_follow_up_date &&
                  application.next_follow_up_date <= today &&
                  application.status !== "Rejected" &&
                  application.status !== "Withdrawn" &&
                  application.status !== "Offer",
              )
              .map((application) => (
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
                    <p className="text-sm font-medium text-slate-700">
                      Follow-up:{" "}
                      {new Date(
                        application.next_follow_up_date!,
                      ).toLocaleDateString("en-GB")}
                    </p>

                    <span className="mt-1 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      {application.status}
                    </span>
                  </div>
                </Link>
              ))}
          </div>
        )}
      </div>
    </div>
  );
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