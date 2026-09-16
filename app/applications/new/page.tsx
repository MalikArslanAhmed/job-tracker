"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewApplicationPage() {
    const router = useRouter();

    const [form, setForm] = useState({
        company: "",
        job_title: "",
        job_reference: "",
        location: "",
        salary: "",
        job_url: "",
        date_applied: new Date().toISOString().split("T")[0],
        closing_date: "",
        status: "Applied",
        follow_up_date: "",
        contact_person: "",
        contact_email: "",
        notes: "",
    });

    const [saving, setSaving] = useState(false);

    function updateField(field: string, value: string) {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setSaving(true);

        try {
            const formElement = event.currentTarget;

            const resumeInput = formElement.elements.namedItem(
                "resume_file",
            ) as HTMLInputElement;

            const coverLetterInput = formElement.elements.namedItem(
                "cover_letter_file",
            ) as HTMLInputElement;

            let resumeFileName = "";
            let coverLetterFileName = "";
            let jobDescriptionFileName = "";
            // Upload Resume
            if (resumeInput.files && resumeInput.files.length > 0) {
                const file = resumeInput.files[0];

                const uploadData = new FormData();
                uploadData.append("file", file);

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

            // Upload Cover Letter
            if (
                coverLetterInput.files &&
                coverLetterInput.files.length > 0
            ) {
                const file = coverLetterInput.files[0];

                const uploadData = new FormData();
                uploadData.append("file", file);

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
            // Upload Job Description
            const jobDescriptionInput = formElement.elements.namedItem(
                "job_description_file",
            ) as HTMLInputElement;

            if (
                jobDescriptionInput.files &&
                jobDescriptionInput.files.length > 0
            ) {
                const file = jobDescriptionInput.files[0];

                const uploadData = new FormData();
                uploadData.append("file", file);

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
            // Save application
            const response = await fetch("/api/applications", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...form,
                    resume_file: resumeFileName || null,
                    cover_letter_file: coverLetterFileName || null,
                    job_description_file: jobDescriptionFileName || null,
                    contact_person: form.contact_person,
                    contact_email: form.contact_email,
                }),
            });

            if (response.ok) {
                router.push("/applications");
                router.refresh();
            } else {
                throw new Error("Application save failed.");
            }
        } catch (error) {
            console.error(error);
            alert("Something went wrong while saving the application.");
            setSaving(false);
        }
    }

    return (
        <div className="mx-auto max-w-4xl px-6 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">
                    Add Application
                </h1>

                <p className="mt-1 text-sm text-slate-600">
                    Add a new job application to your tracker.
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="space-y-8"
            >
                <section className="rounded-xl border border-slate-200 bg-white p-6">
                    <h2 className="text-lg font-semibold">
                        Job Details
                    </h2>

                    <div className="mt-6 grid gap-5 sm:grid-cols-2">
                        <Field
                            label="Company *"
                            value={form.company}
                            onChange={(value) =>
                                updateField("company", value)
                            }
                            required
                        />

                        <Field
                            label="Job Title *"
                            value={form.job_title}
                            onChange={(value) =>
                                updateField("job_title", value)
                            }
                            required
                        />

                        <Field
                            label="Job Reference"
                            value={form.job_reference}
                            onChange={(value) =>
                                updateField("job_reference", value)
                            }
                        />

                        <Field
                            label="Location"
                            value={form.location}
                            onChange={(value) =>
                                updateField("location", value)
                            }
                        />

                        <Field
                            label="Salary"
                            value={form.salary}
                            onChange={(value) =>
                                updateField("salary", value)
                            }
                        />

                        <Field
                            label="Job URL"
                            value={form.job_url}
                            onChange={(value) =>
                                updateField("job_url", value)
                            }
                            type="url"
                        />
                    </div>
                </section>

                <section className="rounded-xl border border-slate-200 bg-white p-6">
                    <h2 className="text-lg font-semibold">
                        Application
                    </h2>

                    <div className="mt-6 grid gap-5 sm:grid-cols-2">
                        <Field
                            label="Date Applied"
                            value={form.date_applied}
                            onChange={(value) =>
                                updateField("date_applied", value)
                            }
                            type="date"
                            required
                        />

                        <Field
                            label="Closing Date"
                            value={form.closing_date}
                            onChange={(value) =>
                                updateField("closing_date", value)
                            }
                            type="date"
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Status
                            </label>

                            <select
                                value={form.status}
                                onChange={(event) =>
                                    updateField("status", event.target.value)
                                }
                                className="mt-2 w-full rounded-lg border px-3 py-2.5"
                            >
                                <option>Applied</option>
                                <option>Shortlisted</option>
                                <option>Interview</option>
                                <option>Final Stage</option>
                                <option>Offer</option>
                                <option>Rejected</option>
                                <option>Withdrawn</option>
                            </select>
                        </div>

                        <Field
                            label="Follow-up Date"
                            value={form.follow_up_date}
                            onChange={(value) =>
                                updateField("follow_up_date", value)
                            }
                            type="date"
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Contact Person
                            </label>

                            <input
                                type="text"
                                value={form.contact_person}
                                onChange={(event) =>
                                    updateField("contact_person", event.target.value)
                                }
                                placeholder="e.g. Sarah Smith"
                                className="mt-2 w-full rounded-lg border px-3 py-2.5"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Contact Email
                            </label>

                            <input
                                type="email"
                                value={form.contact_email}
                                onChange={(event) =>
                                    updateField("contact_email", event.target.value)
                                }
                                placeholder="e.g. sarah@company.com"
                                className="mt-2 w-full rounded-lg border px-3 py-2.5"
                            />
                        </div>
                    </div>
                </section>
                <section className="rounded-xl border border-slate-200 bg-white p-6">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Application Documents
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Keep track of the exact documents you used for this application.
                    </p>

                    <div className="mt-5 space-y-5">
                        <div>
                            <label className="text-sm font-medium text-slate-700">
                                Resume
                            </label>

                            <input
                                name="resume_file"
                                type="file"
                                accept=".pdf,.doc,.docx"
                                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-700">
                                Cover Letter
                            </label>

                            <input
                                name="cover_letter_file"
                                type="file"
                                accept=".pdf,.doc,.docx"
                                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-700">
                                Job Description
                            </label>
                            <input
                                name="job_description_file"
                                type="file"
                                accept=".pdf,.doc,.docx"
                                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                    </div>
                </section>
                <section className="rounded-xl border border-slate-200 bg-white p-6">
                    <h2 className="text-lg font-semibold">
                        Notes
                    </h2>

                    <textarea
                        value={form.notes}
                        onChange={(event) =>
                            updateField("notes", event.target.value)
                        }
                        rows={5}
                        placeholder="Anything important about this application..."
                        className="mt-4 w-full rounded-lg border px-3 py-2.5"
                    />
                </section>

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => router.push("/applications")}
                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                    >
                        Add Application
                    </button>
                </div>
            </form>
        </div>
    );
}

function Field({
    label,
    value,
    onChange,
    type = "text",
    required = false,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    required?: boolean;
}) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700">
                {label}
            </label>

            <input
                type={type}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                required={required}
                className="mt-2 w-full rounded-lg border px-3 py-2.5"
            />
        </div>
    );
}