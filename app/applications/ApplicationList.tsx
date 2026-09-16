"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Application = {
    id: number;
    company: string;
    job_title: string;
    location: string | null;
    date_applied: string;
    closing_date: string | null;
    status: string;
};

export default function ApplicationList({
    applications,
}: {
    applications: Application[];
}) {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("All");
    const [dateFilter, setDateFilter] = useState("All");
    const [specificDate, setSpecificDate] = useState("");
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const filteredApplications = useMemo(() => {
        const query = search.trim().toLowerCase();

        return applications
            .filter((application) => {
                const matchesSearch =
                    !query ||
                    application.company.toLowerCase().includes(query) ||
                    application.job_title.toLowerCase().includes(query) ||
                    application.location?.toLowerCase().includes(query);

                const matchesStatus =
                    status === "All" || application.status === status;

                const matchesDate = matchesDateFilter(
                    application.date_applied,
                    dateFilter,
                    specificDate,
                );

                return (
                    matchesSearch &&
                    matchesStatus &&
                    matchesDate
                );
            })
            .sort((a, b) => {
                const dateDifference =
                    new Date(b.date_applied).getTime() -
                    new Date(a.date_applied).getTime();

                if (dateDifference !== 0) {
                    return dateDifference;
                }

                // Higher ID = application added later.
                return b.id - a.id;
            });
    }, [
        applications,
        search,
        status,
        dateFilter,
        specificDate,
    ]);

    const groupedApplications = useMemo(() => {
        const groups: Record<string, Application[]> = {};

        filteredApplications.forEach((application) => {
            if (!groups[application.date_applied]) {
                groups[application.date_applied] = [];
            }

            groups[application.date_applied].push(application);
        });

        return Object.entries(groups).sort(
            ([dateA], [dateB]) =>
                new Date(dateB).getTime() -
                new Date(dateA).getTime(),
        );
    }, [filteredApplications]);

    async function handleDelete(
        event: React.MouseEvent<HTMLButtonElement>,
        id: number,
        company: string,
    ) {
        event.preventDefault();
        event.stopPropagation();

        const confirmed = window.confirm(
            `Are you sure you want to delete the application for ${company}?`,
        );

        if (!confirmed) {
            return;
        }

        setDeletingId(id);

        try {
            const response = await fetch("/api/applications", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id }),
            });

            if (!response.ok) {
                throw new Error("Failed to delete application.");
            }

            window.location.reload();
        } catch (error) {
            console.error(error);
            alert(
                "Something went wrong while deleting the application.",
            );
            setDeletingId(null);
        }
    }

    return (
        <>
            {/* Search and filters */}
            <div className="mb-5 grid gap-3 md:grid-cols-3">
                {/* Search */}
                <input
                    type="search"
                    value={search}
                    onChange={(event) =>
                        setSearch(event.target.value)
                    }
                    placeholder="Search company, job title or location..."
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                {/* Status filter */}
                <select
                    value={status}
                    onChange={(event) =>
                        setStatus(event.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                    <option value="All">All Statuses</option>
                    <option value="Applied">Applied</option>
                    <option value="Shortlisted">
                        Shortlisted
                    </option>
                    <option value="Interview">Interview</option>
                    <option value="Final Stage">
                        Final Stage
                    </option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Withdrawn">Withdrawn</option>
                </select>

                {/* Date filter */}
                <select
                    value={dateFilter}
                    onChange={(event) => {
                        setDateFilter(event.target.value);

                        if (event.target.value !== "Specific") {
                            setSpecificDate("");
                        }
                    }}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                    <option value="All">All Dates</option>
                    <option value="Today">Today</option>
                    <option value="Yesterday">
                        Yesterday
                    </option>
                    <option value="Specific">
                        Specific Date
                    </option>
                </select>
            </div>

            {/* Specific date */}
            {dateFilter === "Specific" && (
                <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-slate-700">
                        Select date:
                    </label>

                    <input
                        type="date"
                        value={specificDate}
                        onChange={(event) =>
                            setSpecificDate(event.target.value)
                        }
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </div>
            )}

            {/* Filtered application count */}
            <div className="mb-5 flex items-center justify-between">
                <p className="text-sm text-slate-500">
                    Showing{" "}
                    <span className="font-semibold text-slate-700">
                        {filteredApplications.length}
                    </span>{" "}
                    {filteredApplications.length === 1
                        ? "application"
                        : "applications"}
                </p>
            </div>

            {/* Applications */}
            {filteredApplications.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                    <p className="text-sm font-medium text-slate-700">
                        No applications found.
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                        Try changing your search or filters.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {groupedApplications.map(
                        ([date, dayApplications]) => (
                            <section key={date}>
                                {/* Date heading */}
                                <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-2">
                                    <div>
                                        <h2 className="text-base font-semibold text-slate-900">
                                            {formatApplicationDate(
                                                date,
                                            )}
                                        </h2>

                                        <p className="mt-0.5 text-xs text-slate-500">
                                            {dayApplications.length}{" "}
                                            {dayApplications.length ===
                                            1
                                                ? "application"
                                                : "applications"}
                                        </p>
                                    </div>
                                </div>

                                {/* Applications for this date */}
                                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                                    <div className="divide-y divide-slate-100">
                                        {dayApplications.map(
                                            (
                                                application,
                                                index,
                                            ) => {
                                                const closingInfo =
                                                    getClosingInfo(
                                                        application.closing_date,
                                                    );

                                                /*
                                                 * Latest application
                                                 * gets the highest number.
                                                 *
                                                 * Example:
                                                 * 3 applications:
                                                 * #3
                                                 * #2
                                                 * #1
                                                 */
                                                const applicationNumber =
                                                    dayApplications.length -
                                                    index;

                                                return (
                                                    <Link
                                                        key={
                                                            application.id
                                                        }
                                                        href={`/applications/${application.id}`}
                                                        className="group block p-5 transition hover:bg-slate-50"
                                                    >
                                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                                            {/* Left side */}
                                                            <div className="flex min-w-0 items-start gap-4">
                                                                {/* Application number */}
                                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
                                                                    {
                                                                        applicationNumber
                                                                    }
                                                                </div>

                                                                {/* Application information */}
                                                                <div className="min-w-0">
                                                                    <div className="flex flex-wrap items-center gap-2">
                                                                        <h3 className="font-semibold text-slate-900">
                                                                            {
                                                                                application.company
                                                                            }
                                                                        </h3>

                                                                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
                                                                            {
                                                                                application.status
                                                                            }
                                                                        </span>
                                                                    </div>

                                                                    <p className="mt-1 text-sm text-slate-700">
                                                                        {
                                                                            application.job_title
                                                                        }
                                                                    </p>

                                                                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                                                                        {application.location && (
                                                                            <span>
                                                                                📍{" "}
                                                                                {
                                                                                    application.location
                                                                                }
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Right side */}
                                                            <div className="flex shrink-0 items-center gap-4 sm:ml-4">
                                                                <div className="text-left sm:text-right">
                                                                    {closingInfo.label && (
                                                                        <p
                                                                            className={`text-sm font-medium ${closingInfo.className}`}
                                                                        >
                                                                            {
                                                                                closingInfo.label
                                                                            }
                                                                        </p>
                                                                    )}

                                                                    {closingInfo.date && (
                                                                        <p className="mt-1 text-xs text-slate-500">
                                                                            {
                                                                                closingInfo.date
                                                                            }
                                                                        </p>
                                                                    )}
                                                                </div>

                                                                <button
                                                                    type="button"
                                                                    disabled={
                                                                        deletingId ===
                                                                        application.id
                                                                    }
                                                                    onClick={(
                                                                        event,
                                                                    ) =>
                                                                        handleDelete(
                                                                            event,
                                                                            application.id,
                                                                            application.company,
                                                                        )
                                                                    }
                                                                    className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                                >
                                                                    {deletingId ===
                                                                    application.id
                                                                        ? "Deleting..."
                                                                        : "Delete"}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                );
                                            },
                                        )}
                                    </div>
                                </div>
                            </section>
                        ),
                    )}
                </div>
            )}
        </>
    );
}

function matchesDateFilter(
    applicationDate: string,
    dateFilter: string,
    specificDate: string,
) {
    if (dateFilter === "All") {
        return true;
    }

    if (dateFilter === "Specific") {
        return (
            specificDate !== "" &&
            applicationDate === specificDate
        );
    }

    const today = new Date();

    const todayString = formatDateForComparison(today);

    if (dateFilter === "Today") {
        return applicationDate === todayString;
    }

    if (dateFilter === "Yesterday") {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        return (
            applicationDate ===
            formatDateForComparison(yesterday)
        );
    }

    return true;
}

function formatDateForComparison(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function formatApplicationDate(date: string) {
    const applicationDate = new Date(`${date}T00:00:00`);

    return applicationDate.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

function getClosingInfo(closingDate: string | null) {
    if (!closingDate) {
        return {
            label: "",
            className: "",
            date: "",
        };
    }

    const today = new Date();
    const closing = new Date(`${closingDate}T23:59:59`);

    const todayStart = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
    );

    const closingStart = new Date(
        closing.getFullYear(),
        closing.getMonth(),
        closing.getDate(),
    );

    const differenceMs =
        closingStart.getTime() - todayStart.getTime();

    const differenceDays = Math.ceil(
        differenceMs / (1000 * 60 * 60 * 24),
    );

    if (differenceDays < 0) {
        const daysAgo = Math.abs(differenceDays);

        return {
            label: "Application closed",
            className: "text-red-600",
            date:
                daysAgo === 1
                    ? "1 day ago"
                    : `${daysAgo} days ago`,
        };
    }

    if (differenceDays === 0) {
        return {
            label: "Accepting applications",
            className: "text-amber-600",
            date: "Closes today",
        };
    }

    return {
        label: "Accepting applications",
        className:
            differenceDays <= 7
                ? "text-amber-600"
                : "text-emerald-600",
        date:
            differenceDays === 1
                ? "1 day left"
                : `${differenceDays} days left`,
    };
}