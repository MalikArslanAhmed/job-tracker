import Link from "next/link";
import { notFound } from "next/navigation";
import { getApplicationById } from "@/lib/applications";
import DeleteApplicationButton from "./DeleteApplicationButton";
import FollowUps from "./FollowUps";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ApplicationDetailPage({
  params,
}: PageProps) {
  const { id } = await params;
  const application = getApplicationById(Number(id));

  if (!application) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-8">
        <Link
          href="/applications"
          className="text-sm text-slate-500 transition hover:text-slate-900"
        >
          ← Back to Applications
        </Link>

        <div className="mt-4 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {application.job_title}
            </h1>

            <p className="mt-1 text-slate-600">
              {application.company}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
              {application.status}
            </span>

            <Link
              href={`/applications/${application.id}/edit`}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Edit
            </Link>

            <DeleteApplicationButton id={application.id} />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Job Details</h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Detail label="Company" value={application.company} />
            <Detail label="Job Title" value={application.job_title} />
            <Detail label="Job Reference" value={application.job_reference} />
            <Detail label="Location" value={application.location} />
            <Detail label="Salary" value={application.salary} />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Job URL
              </p>

              {application.job_url ? (
                <a
                  href={application.job_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Open Job Posting ↗
                </a>
              ) : (
                <p className="mt-1 text-sm text-slate-900">—</p>
              )}
            </div>
            <Detail
              label="Contact Person"
              value={application.contact_person}
            />

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Contact Email
              </p>

              {application.contact_email ? (
                <a
                  href={`mailto:${application.contact_email}`}
                  className="mt-1 inline-block text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                >
                  {application.contact_email}
                </a>
              ) : (
                <p className="mt-1 text-sm text-slate-900">—</p>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Application</h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Detail
              label="Date Applied"
              value={formatDate(application.date_applied)}
            />

            <Detail
              label="Closing Date"
              value={formatDate(application.closing_date)}
            />

            <Detail
              label="Follow-up Date"
              value={formatDate(application.follow_up_date)}
            />
          </div>
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Interview</h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Detail
              label="Interview Date"
              value={formatInterviewDate(application.interview_date)}
            />

            <Detail
              label="Interview Notes"
              value={application.interview_notes}
            />
          </div>
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Application Documents
          </h2>

          <div className="mt-5 space-y-4">
            <DocumentDetail
              label="Resume"
              value={application.resume_file}
            />

            <DocumentDetail
              label="Cover Letter"
              value={application.cover_letter_file}
            />

            <DocumentDetail
              label="Job Description"
              value={application.job_description_file}
            />
          </div>
        </section>
        {application.notes && (
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold">Notes</h2>

            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">
              {application.notes}
            </p>
          </section>
        )}
        <FollowUps applicationId={application.id} />
      </div>
    </div>
  );
}
function DocumentDetail({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      {value ? (
        <a
          href={`/api/files/${encodeURIComponent(value)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-block text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
        >
          📄 {value}
        </a>
      ) : (
        <p className="mt-1 text-sm text-slate-500">
          Not added
        </p>
      )}
    </div>
  );
}
function Detail({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-sm text-slate-900">
        {value || "—"}
      </p>
    </div>
  );
}

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-GB");
}
function formatInterviewDate(value: string | null) {
  if (!value) return "—";

  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}