import Link from "next/link";
import { notFound } from "next/navigation";
import { getApplicationById } from "@/lib/applications";
import EditApplicationForm from "./EditApplicationForm";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditApplicationPage({
  params,
}: PageProps) {
  const { id } = await params;

  const application = getApplicationById(Number(id));

  if (!application) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-8">
        <Link
          href={`/applications/${application.id}`}
          className="text-sm text-gray-500 hover:text-gray-900"
        >
          ← Back to Application
        </Link>

        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          Edit Application
        </h1>

        <p className="mt-1 text-sm text-gray-600">
          Update the details for {application.company} —{" "}
          {application.job_title}
        </p>
      </div>

      <EditApplicationForm application={application} />
    </div>
  );
}