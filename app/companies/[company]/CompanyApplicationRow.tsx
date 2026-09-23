"use client";

import { useState } from "react";
import SendFollowUpButton from "@/app/follow-ups/SendFollowUpButton";

type Application = {
    id: number;
    company: string;
    job_title: string;
    status: string;
    date_applied: string;
    closing_date: string | null;
    location: string | null;
    salary: string | null;
    job_url: string | null;
    next_follow_up_date: string | null;
    next_follow_up_id: number | null;
};

type Props = {
    application: Application;
    followUp: {
        label: string;
        className: string;
    };
};

function formatDate(date: string | null) {
    if (!date) return "Not specified";

    return new Date(
        `${date}T00:00:00`,
    ).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function getStatusClasses(status: string) {
    switch (status) {
        case "Applied":
            return "bg-blue-50 text-blue-700";

        case "Shortlisted":
            return "bg-purple-50 text-purple-700";

        case "Interview":
            return "bg-amber-50 text-amber-700";

        case "Final Stage":
            return "bg-indigo-50 text-indigo-700";

        case "Offer":
            return "bg-green-50 text-green-700";

        case "Rejected":
            return "bg-red-50 text-red-700";

        case "Withdrawn":
            return "bg-slate-100 text-slate-600";

        default:
            return "bg-slate-100 text-slate-700";
    }
}

export default function CompanyApplicationRow({
    application,
    followUp,
}: Props) {
    const [deleting, setDeleting] = useState(false);

    async function handleDelete(
        event: React.MouseEvent<HTMLButtonElement>,
    ) {
        event.stopPropagation();

        const confirmed = window.confirm(
            `Are you sure you want to delete the application for ${application.company}?`,
        );

        if (!confirmed) {
            return;
        }

        setDeleting(true);

        try {
            const response = await fetch(
                "/api/applications",
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        id: application.id,
                    }),
                },
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to delete application.",
                );
            }

            window.location.reload();
        } catch (error) {
            console.error(error);

            alert(
                "Something went wrong while deleting the application.",
            );

            setDeleting(false);
        }
    }
    return (
        <div
            role="link"
            tabIndex={0}
            onClick={() => {
                window.location.href = `/applications/${application.id}`;
            }}
            onKeyDown={(event) => {
                if (
                    event.key === "Enter" ||
                    event.key === " "
                ) {
                    event.preventDefault();

                    window.location.href = `/applications/${application.id}`;
                }
            }}
            className="cursor-pointer p-5 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
        >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-slate-900">
                            {application.job_title}
                        </h3>

                        <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                                application.status,
                            )}`}
                        >
                            {application.status}
                        </span>
                    </div>

                    <div className="mt-3 grid gap-2 text-sm text-slate-500 sm:grid-cols-2">
                        <div>
                            <span className="font-medium text-slate-600">
                                Applied:
                            </span>{" "}
                            {formatDate(
                                application.date_applied,
                            )}
                        </div>

                        <div>
                            <span className="font-medium text-slate-600">
                                Closing:
                            </span>{" "}
                            {formatDate(
                                application.closing_date,
                            )}
                        </div>

                        {application.location && (
                            <div>
                                <span className="font-medium text-slate-600">
                                    Location:
                                </span>{" "}
                                {application.location}
                            </div>
                        )}

                        {application.salary && (
                            <div>
                                <span className="font-medium text-slate-600">
                                    Salary:
                                </span>{" "}
                                {application.salary}
                            </div>
                        )}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${followUp.className}`}
                        >
                            {followUp.label}
                        </span>

                        {application.next_follow_up_date && (
                            <span className="text-xs text-slate-500">
                                {formatDate(
                                    application.next_follow_up_date,
                                )}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {application.next_follow_up_id && (
                        <div
                            onClick={(event) =>
                                event.stopPropagation()
                            }
                        >
                            <SendFollowUpButton
                                followUpId={
                                    application.next_follow_up_id
                                }
                            />
                        </div>
                    )}

                    {application.job_url && (
                        <a
                            href={application.job_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(event) =>
                                event.stopPropagation()
                            }
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                            Job Posting
                        </a>
                    )}

                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={deleting}
                        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {deleting
                            ? "Deleting..."
                            : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
}