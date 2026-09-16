import ApplicationList from "./ApplicationList";
import Link from "next/link";
import { getApplications } from "@/lib/applications";
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
export default function ApplicationsPage() {
  const applications = getApplications();

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Applications
          </h1>

          <p className="mt-1 text-sm text-gray-600">
            Manage all your job applications.
          </p>
        </div>

        <Link
          href="/applications/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          + Add Application
        </Link>
      </div>

      <div className="mt-8">
        <ApplicationList applications={applications} />
      </div>
    </div>
  );
}