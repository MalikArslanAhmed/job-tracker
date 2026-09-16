"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type Application = {
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
  notes: string | null;
  resume_file: string | null;
  cover_letter_file: string | null;
  job_description_file: string | null;
  contact_person: string | null;
  contact_email: string | null;
};

export default function EditApplicationForm({
  application,
}: {
  application: Application;
}) {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      const formElement = event.currentTarget;
      const formData = new FormData(formElement);

      let resumeFileName = application.resume_file;
      let coverLetterFileName = application.cover_letter_file;
      let jobDescriptionFileName = application.job_description_file;

      // Upload new Resume if selected
      const resumeFile = formData.get("resume_file");

      if (resumeFile instanceof File && resumeFile.size > 0) {
        const uploadData = new FormData();
        uploadData.append("file", resumeFile);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Resume upload failed.");
        }

        const uploadResult = await uploadResponse.json();

        resumeFileName = uploadResult.fileName;
      }

      // Upload new Cover Letter if selected
      const coverLetterFile = formData.get("cover_letter_file");

      if (
        coverLetterFile instanceof File &&
        coverLetterFile.size > 0
      ) {
        const uploadData = new FormData();
        uploadData.append("file", coverLetterFile);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Cover letter upload failed.");
        }

        const uploadResult = await uploadResponse.json();

        coverLetterFileName = uploadResult.fileName;
      }

      // Upload new Job Description if selected
      const jobDescriptionFile = formData.get(
        "job_description_file",
      );

      if (
        jobDescriptionFile instanceof File &&
        jobDescriptionFile.size > 0
      ) {
        const uploadData = new FormData();
        uploadData.append("file", jobDescriptionFile);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Job description upload failed.");
        }

        const uploadResult = await uploadResponse.json();

        jobDescriptionFileName = uploadResult.fileName;
      }

      const data = {
        id: application.id,
        company: formData.get("company"),
        job_title: formData.get("job_title"),
        job_reference: formData.get("job_reference"),
        location: formData.get("location"),
        salary: formData.get("salary"),
        job_url: formData.get("job_url"),
        date_applied: formData.get("date_applied"),
        closing_date: formData.get("closing_date"),
        status: formData.get("status"),
        follow_up_date: formData.get("follow_up_date"),
        interview_date: formData.get("interview_date"),
        interview_notes: formData.get("interview_notes"),
        notes: formData.get("notes"),
        resume_file: resumeFileName,
        cover_letter_file: coverLetterFileName,
        job_description_file: jobDescriptionFileName,
        contact_person: formData.get("contact_person"),
        contact_email: formData.get("contact_email"),
      };

      const response = await fetch("/api/applications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update application.");
      }

      router.push(`/applications/${application.id}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update application.",
      );
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Job Details</h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">Company *</label>
            <input
              name="company"
              defaultValue={application.company}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Job Title *</label>
            <input
              name="job_title"
              defaultValue={application.job_title}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Job Reference</label>
            <input
              name="job_reference"
              defaultValue={application.job_reference ?? ""}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Location</label>
            <input
              name="location"
              defaultValue={application.location ?? ""}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Salary</label>
            <input
              name="salary"
              defaultValue={application.salary ?? ""}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Job URL</label>
            <input
              name="job_url"
              type="url"
              defaultValue={application.job_url ?? ""}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Application Details</h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">Date Applied *</label>
            <input
              name="date_applied"
              type="date"
              defaultValue={application.date_applied}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Closing Date</label>
            <input
              name="closing_date"
              type="date"
              defaultValue={application.closing_date ?? ""}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Status</label>
            <select
              name="status"
              defaultValue={application.status}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="Applied">Applied</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Interview">Interview</option>
              <option value="Final Stage">Final Stage</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
              <option value="Withdrawn">Withdrawn</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Follow-up Date</label>
            <input
              name="follow_up_date"
              type="date"
              defaultValue={application.follow_up_date ?? ""}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">
              Interview Date
            </label>

            <input
              name="interview_date"
              type="datetime-local"
              defaultValue={application.interview_date ?? ""}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">
              Contact Person
            </label>
            <input
              name="contact_person"
              type="text"
              defaultValue={application.contact_person ?? ""}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="e.g. Sarah Smith"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Contact Email
            </label>
            <input
              name="contact_email"
              type="email"
              defaultValue={application.contact_email ?? ""}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="e.g. sarah@company.com"
            />
          </div>
        </div>
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Interview
        </h2>

        <div className="mt-5 space-y-5">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Interview Notes
            </label>

            <textarea
              name="interview_notes"
              defaultValue={application.interview_notes ?? ""}
              rows={5}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Add interview notes, questions, feedback, etc."
            />
          </div>
        </div>
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Application Documents
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Upload a new file only if you want to replace the existing document.
        </p>

        <div className="mt-5 space-y-5">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Resume
            </label>

            {application.resume_file && (
              <p className="mt-1 text-xs text-slate-500">
                Current: {application.resume_file}
              </p>
            )}

            <input
              name="resume_file"
              type="file"
              accept=".pdf,.doc,.docx"
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Cover Letter
            </label>

            {application.cover_letter_file && (
              <p className="mt-1 text-xs text-slate-500">
                Current: {application.cover_letter_file}
              </p>
            )}

            <input
              name="cover_letter_file"
              type="file"
              accept=".pdf,.doc,.docx"
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:font-medium file:text-slate-700 hover:file:bg-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Job Description
            </label>

            {application.job_description_file && (
              <p className="mt-1 text-xs text-slate-500">
                Current: {application.job_description_file}
              </p>
            )}

            <input
              name="job_description_file"
              type="file"
              accept=".pdf,.doc,.docx"
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition file:mr-4 file:rounded-md file:bg-slate-100 file:px-3 file:py-1.5 file:font-medium file:text-slate-700 hover:file:bg-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Notes</h2>

        <textarea
          name="notes"
          defaultValue={application.notes ?? ""}
          rows={6}
          className="mt-5 w-full rounded-lg border px-3 py-2 text-sm"
        />
      </section>

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() =>
            router.push(`/applications/${application.id}`)
          }
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}