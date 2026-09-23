"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CompanySummary } from "@/lib/applications";

type Props = {
    companies: CompanySummary[];
};

function formatApplicationDate(date: string) {
    return new Date(`${date}T00:00:00`).toLocaleDateString(
        "en-GB",
        {
            day: "numeric",
            month: "short",
            year: "numeric",
        },
    );
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

function getFollowUpInfo(
    company: CompanySummary,
) {
    if (!company.next_follow_up_date) {
        return {
            category: "none",
            label: "No planned follow-up",
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
        `${company.next_follow_up_date}T00:00:00`,
    );

    const differenceMs =
        followUpDate.getTime() -
        todayStart.getTime();

    const differenceDays = Math.round(
        differenceMs /
        (1000 * 60 * 60 * 24),
    );

    if (differenceDays < 0) {
        const daysOverdue =
            Math.abs(differenceDays);

        return {
            category: "overdue",
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
            category: "today",
            label: "Follow up today",
            className:
                "bg-amber-50 text-amber-700",
        };
    }

    if (differenceDays === 1) {
        return {
            category: "tomorrow",
            label: "Follow up tomorrow",
            className:
                "bg-amber-50 text-amber-700",
        };
    }

    return {
        category: "later",
        label: `Follow up in ${differenceDays} days`,
        className:
            "bg-emerald-50 text-emerald-700",
    };
}

export default function CompaniesPage({
    companies,
}: Props) {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] =
        useState("All");
    const [applicationFilter, setApplicationFilter] =
        useState("All");
    const [followUpFilter, setFollowUpFilter] =
        useState("All");
    const [sortBy, setSortBy] =
        useState("latest-newest");

    const filteredCompanies = useMemo(() => {
        let result = [...companies];

        // Search
        if (search.trim()) {
            const searchTerm = search
                .trim()
                .toLowerCase();

            result = result.filter((company) =>
                company.company
                    .toLowerCase()
                    .includes(searchTerm),
            );
        }

        // Status
        if (statusFilter !== "All") {
            result = result.filter(
                (company) =>
                    company.latest_status === statusFilter,
            );
        }

        // Application count
        if (applicationFilter === "1") {
            result = result.filter(
                (company) =>
                    company.application_count === 1,
            );
        }

        if (applicationFilter === "2+") {
            result = result.filter(
                (company) =>
                    company.application_count >= 2,
            );
        }

        // Follow-up
        if (followUpFilter !== "All") {
            result = result.filter(
                (company) =>
                    getFollowUpInfo(company).category ===
                    followUpFilter,
            );
        }
        // Sorting
        result.sort((a, b) => {
            switch (sortBy) {
                case "latest-oldest":
                    return (
                        new Date(
                            `${a.latest_application_date}T00:00:00`,
                        ).getTime() -
                        new Date(
                            `${b.latest_application_date}T00:00:00`,
                        ).getTime()
                    );

                case "applications-high":
                    return (
                        b.application_count -
                        a.application_count
                    );

                case "applications-low":
                    return (
                        a.application_count -
                        b.application_count
                    );

                case "name-az":
                    return a.company.localeCompare(
                        b.company,
                    );

                case "name-za":
                    return b.company.localeCompare(
                        a.company,
                    );

                case "latest-newest":
                default:
                    return (
                        new Date(
                            `${b.latest_application_date}T00:00:00`,
                        ).getTime() -
                        new Date(
                            `${a.latest_application_date}T00:00:00`,
                        ).getTime()
                    );
            }
        });

        return result;
    }, [
        companies,
        search,
        statusFilter,
        applicationFilter,
        followUpFilter,
        sortBy,
    ]);

    const totalCompanies = companies.length;

    const totalApplications = companies.reduce(
        (total, company) =>
            total + company.application_count,
        0,
    );

    const activeCompanies = companies.filter(
        (company) =>
            company.active_application_count > 0,
    ).length;

    const multipleApplicationCompanies =
        companies.filter(
            (company) =>
                company.application_count >= 2,
        ).length;

    return (
        <div className="mx-auto max-w-7xl px-6 py-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    Companies
                </h1>

                <p className="mt-1 text-sm text-gray-600">
                    View and manage the companies you have
                    applied to.
                </p>
            </div>

            {/* Summary */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">
                        Total Companies
                    </p>

                    <p className="mt-2 text-3xl font-bold text-slate-900">
                        {totalCompanies}
                    </p>
                </div>

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
                        Active Companies
                    </p>

                    <p className="mt-2 text-3xl font-bold text-slate-900">
                        {activeCompanies}
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">
                        Multiple Applications
                    </p>

                    <p className="mt-2 text-3xl font-bold text-slate-900">
                        {multipleApplicationCompanies}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="mt-8 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="grid gap-3 lg:grid-cols-5">
                    {/* Search */}
                    <div className="lg:col-span-2">
                        <label
                            htmlFor="company-search"
                            className="sr-only"
                        >
                            Search companies
                        </label>

                        <input
                            id="company-search"
                            type="text"
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Search companies..."
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    {/* Status */}
                    <select
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(event.target.value)
                        }
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                        <option value="All">
                            All Statuses
                        </option>
                        <option value="Applied">
                            Applied
                        </option>
                        <option value="Shortlisted">
                            Shortlisted
                        </option>
                        <option value="Interview">
                            Interview
                        </option>
                        <option value="Final Stage">
                            Final Stage
                        </option>
                        <option value="Offer">
                            Offer
                        </option>
                        <option value="Rejected">
                            Rejected
                        </option>
                        <option value="Withdrawn">
                            Withdrawn
                        </option>
                    </select>

                    {/* Applications */}
                    <select
                        value={applicationFilter}
                        onChange={(event) =>
                            setApplicationFilter(
                                event.target.value,
                            )
                        }
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                        <option value="All">
                            All Applications
                        </option>
                        <option value="1">
                            1 Application
                        </option>
                        <option value="2+">
                            2+ Applications
                        </option>
                    </select>

                    {/* Follow-up */}
                    <select
                        value={followUpFilter}
                        onChange={(event) =>
                            setFollowUpFilter(
                                event.target.value,
                            )
                        }
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                        <option value="All">
                            All Follow-ups
                        </option>
                        <option value="overdue">
                            Overdue
                        </option>
                        <option value="today">
                            Today
                        </option>
                        <option value="tomorrow">
                            Tomorrow
                        </option>
                        <option value="later">
                            Later
                        </option>
                        <option value="none">
                            No Follow-up
                        </option>
                    </select>
                </div>

                {/* Sort + result count */}
                <div className="mt-3 flex flex-col gap-3 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <label
                            htmlFor="company-sort"
                            className="text-sm text-slate-500"
                        >
                            Sort:
                        </label>

                        <select
                            id="company-sort"
                            value={sortBy}
                            onChange={(event) =>
                                setSortBy(event.target.value)
                            }
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="latest-newest">
                                Latest Application — Newest
                            </option>
                            <option value="latest-oldest">
                                Latest Application — Oldest
                            </option>
                            <option value="applications-high">
                                Most Applications
                            </option>
                            <option value="applications-low">
                                Fewest Applications
                            </option>
                            <option value="name-az">
                                Company Name A–Z
                            </option>
                            <option value="name-za">
                                Company Name Z–A
                            </option>
                        </select>
                    </div>

                    <p className="text-sm text-slate-500">
                        Showing{" "}
                        <span className="font-medium text-slate-700">
                            {filteredCompanies.length}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium text-slate-700">
                            {totalCompanies}
                        </span>{" "}
                        companies
                    </p>
                </div>
            </div>

            {/* Company List */}
            <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                {filteredCompanies.length === 0 ? (
                    <div className="p-10 text-center">
                        <p className="text-sm font-medium text-slate-700">
                            No companies found.
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                            Try changing your filters or search.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {filteredCompanies.map((company) => (
                            <Link
                                key={company.company}
                                href={`/companies/${encodeURIComponent(
                                    company.company,
                                )}`}
                                className="block p-5 transition hover:bg-slate-50"
                            >
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h2 className="font-semibold text-slate-900">
                                                {company.company}
                                            </h2>

                                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
                                                {company.application_count}{" "}
                                                {company.application_count ===
                                                    1
                                                    ? "application"
                                                    : "applications"}
                                            </span>
                                        </div>

                                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                                            <span>
                                                Latest application:{" "}
                                                {formatApplicationDate(
                                                    company.latest_application_date,
                                                )}
                                            </span>
                                            {company.active_application_count >
                                                0 && (
                                                    <span>
                                                        {
                                                            company.active_application_count
                                                        }{" "}
                                                        active
                                                    </span>
                                                )}

                                            {company.next_follow_up_date && (
                                                <span>
                                                    Next follow-up:{" "}
                                                    {formatApplicationDate(
                                                        company.next_follow_up_date,
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-3">
                                        <div className="flex flex-col items-end gap-2">
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                                                    company.latest_status,
                                                )}`}
                                            >
                                                {company.latest_status}
                                            </span>

                                            {(() => {
                                                const followUp =
                                                    getFollowUpInfo(company);

                                                return (
                                                    <span
                                                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${followUp.className}`}
                                                    >
                                                        {followUp.label}
                                                    </span>
                                                );
                                            })()}
                                        </div>

                                        <span className="text-slate-400">
                                            →
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}