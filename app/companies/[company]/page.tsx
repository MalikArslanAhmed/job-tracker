import Link from "next/link";
import {
    getApplicationsByCompany,
} from "@/lib/applications";
import CompanyApplicationRow from "./CompanyApplicationRow";
import SendCompanyDueFollowUpsButton from "./SendCompanyDueFollowUpsButton";
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

function getFollowUpClasses(
    application: {
        next_follow_up_date: string | null;
    },
    status: string,
) {
    if (
        ["Rejected", "Withdrawn", "Offer"].includes(
            status,
        )
    ) {
        return {
            label: "No planned follow-up",
            className:
                "bg-slate-100 text-slate-600",
        };
    }

    if (!application.next_follow_up_date) {
        return {
            label: "No follow-up planned",
            className:
                "bg-slate-100 text-slate-500",
        };
    }

    const today = new Date();

    const todayStart = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
    );

    const followUpDate = new Date(
        `${application.next_follow_up_date}T00:00:00`,
    );

    const differenceMs =
        followUpDate.getTime() -
        todayStart.getTime();

    const differenceDays = Math.round(
        differenceMs /
        (1000 * 60 * 60 * 24),
    );

    if (differenceDays < 0) {
        const daysOverdue = Math.abs(
            differenceDays,
        );

        return {
            label:
                daysOverdue === 1
                    ? "Overdue by 1 day"
                    : `Overdue by ${daysOverdue} days`,
            className:
                "bg-red-50 text-red-700",
        };
    }

    if (differenceDays === 0) {
        return {
            label: "Follow up today",
            className:
                "bg-amber-50 text-amber-700",
        };
    }

    if (differenceDays === 1) {
        return {
            label: "Follow up tomorrow",
            className:
                "bg-amber-50 text-amber-700",
        };
    }

    return {
        label: `Follow up in ${differenceDays} days`,
        className:
            "bg-emerald-50 text-emerald-700",
    };
}

export default async function CompanyPage({
    params,
}: {
    params: Promise<{ company: string }>;
}) {
    const { company } = await params;

    const decodedCompany = decodeURIComponent(
        company,
    );

    const applications =
        getApplicationsByCompany(
            decodedCompany,
        );

    if (applications.length === 0) {
        return (
            <div className="mx-auto max-w-7xl px-6 py-8">
                <Link
                    href="/companies"
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                    ← Back to Companies
                </Link>

                <div className="mt-8 rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                    <h1 className="text-lg font-semibold text-slate-900">
                        Company not found
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        No applications were found for{" "}
                        {decodedCompany}.
                    </p>
                </div>
            </div>
        );
    }

    const companyName =
        applications[0].company;

    const totalApplications =
        applications.length;

    const activeApplications =
        applications.filter(
            (application) =>
                ![
                    "Rejected",
                    "Withdrawn",
                    "Offer",
                ].includes(application.status),
        ).length;

    const rejectedApplications =
        applications.filter(
            (application) =>
                application.status === "Rejected",
        ).length;

    const latestApplication =
        applications[0];

    return (
        <div className="mx-auto max-w-7xl px-6 py-8">
            {/* Back */}
            <Link
                href="/companies"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
                ← Back to Companies
            </Link>

            {/* Header */}
            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {companyName}
                    </h1>

                    <p className="mt-1 text-sm text-gray-600">
                        All applications submitted to this
                        company.
                    </p>
                </div>

                <SendCompanyDueFollowUpsButton
                    company={companyName}
                />
            </div>

            {/* Summary */}
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">
                        Total Applications
                    </p>

                    <p className="mt-2 text-3xl font-bold text-slate-900">
                        {totalApplications}
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">
                        Active Applications
                    </p>

                    <p className="mt-2 text-3xl font-bold text-slate-900">
                        {activeApplications}
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">
                        Rejected Applications
                    </p>

                    <p className="mt-2 text-3xl font-bold text-slate-900">
                        {rejectedApplications}
                    </p>
                </div>
            </div>

            {/* Latest application */}
            <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Latest Application
                        </p>

                        <h2 className="mt-1 text-lg font-semibold text-slate-900">
                            {latestApplication.job_title}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Applied{" "}
                            {formatDate(
                                latestApplication.date_applied,
                            )}
                        </p>
                    </div>

                    <span
                        className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                            latestApplication.status,
                        )}`}
                    >
                        {latestApplication.status}
                    </span>
                </div>
            </div>

            {/* Applications */}
            <div className="mt-8">
                <div className="mb-4">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Applications
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        {totalApplications}{" "}
                        {totalApplications === 1
                            ? "application"
                            : "applications"}{" "}
                        for {companyName}.
                    </p>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="divide-y divide-slate-100">
                        {applications.map((application) => {
                            const followUp =
                                getFollowUpClasses(
                                    application,
                                    application.status,
                                );

                            return (
                                <CompanyApplicationRow
                                    key={application.id}
                                    application={application}
                                    followUp={followUp}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}