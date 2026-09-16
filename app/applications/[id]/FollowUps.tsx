"use client";

import { useEffect, useState } from "react";

type FollowUp = {
  id: number;
  application_id: number;
  follow_up_date: string;
  status: "Planned" | "Completed";
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type FollowUpsProps = {
  applicationId: number;
};

export default function FollowUps({
  applicationId,
}: FollowUpsProps) {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(
    null,
  );

  const [date, setDate] = useState("");
  const [status, setStatus] = useState<
    "Planned" | "Completed"
  >("Planned");
  const [notes, setNotes] = useState("");

  async function loadFollowUps() {
    try {
      const response = await fetch(
        `/api/follow-ups?applicationId=${applicationId}`,
      );

      if (!response.ok) {
        throw new Error("Failed to load follow-ups.");
      }

      const data = await response.json();
      setFollowUps(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFollowUps();
  }, [applicationId]);

  function resetForm() {
    setDate("");
    setStatus("Planned");
    setNotes("");
    setEditingId(null);
    setShowForm(false);
  }

  function startEditing(followUp: FollowUp) {
    setEditingId(followUp.id);
    setDate(followUp.follow_up_date);
    setStatus(followUp.status);
    setNotes(followUp.notes || "");
    setShowForm(true);
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!date) {
      return;
    }

    const url = "/api/follow-ups";

    const response = await fetch(url, {
      method: editingId ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        editingId
          ? {
              id: editingId,
              follow_up_date: date,
              status,
              notes,
            }
          : {
              application_id: applicationId,
              follow_up_date: date,
              status,
              notes,
            },
      ),
    });

    if (!response.ok) {
      alert("Failed to save follow-up.");
      return;
    }

    resetForm();
    await loadFollowUps();
  }

  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this follow-up?",
    );

    if (!confirmed) {
      return;
    }

    const response = await fetch(
      `/api/follow-ups?id=${id}`,
      {
        method: "DELETE",
      },
    );

    if (!response.ok) {
      alert("Failed to delete follow-up.");
      return;
    }

    await loadFollowUps();
  }

  function formatDate(value: string) {
    const dateValue = new Date(`${value}T00:00:00`);

    return dateValue.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function getFollowUpTiming(
    followUp: FollowUp,
  ) {
    if (followUp.status === "Completed") {
      return {
        label: "Completed",
        className: "text-emerald-600",
      };
    }

    const today = new Date();

    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    const followUpDate = new Date(
      `${followUp.follow_up_date}T00:00:00`,
    );

    const differenceMs =
      followUpDate.getTime() - todayStart.getTime();

    const differenceDays = Math.ceil(
      differenceMs / (1000 * 60 * 60 * 24),
    );

    if (differenceDays < 0) {
      const daysOverdue = Math.abs(differenceDays);

      return {
        label:
          daysOverdue === 1
            ? "Overdue by 1 day"
            : `Overdue by ${daysOverdue} days`,
        className: "text-red-600",
      };
    }

    if (differenceDays === 0) {
      return {
        label: "Follow up today",
        className: "text-amber-600",
      };
    }

    if (differenceDays === 1) {
      return {
        label: "Follow up tomorrow",
        className: "text-amber-600",
      };
    }

    return {
      label: `Follow up in ${differenceDays} days`,
      className: "text-emerald-600",
    };
  }

  const sortedFollowUps = [...followUps].sort(
    (a, b) => {
      const dateDifference =
        new Date(
          `${b.follow_up_date}T00:00:00`,
        ).getTime() -
        new Date(
          `${a.follow_up_date}T00:00:00`,
        ).getTime();

      if (dateDifference !== 0) {
        return dateDifference;
      }

      return b.id - a.id;
    },
  );

  const nextFollowUp = followUps
    .filter(
      (followUp) =>
        followUp.status === "Planned",
    )
    .sort(
      (a, b) =>
        new Date(
          `${a.follow_up_date}T00:00:00`,
        ).getTime() -
        new Date(
          `${b.follow_up_date}T00:00:00`,
        ).getTime(),
    )[0];

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Follow-ups
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Track every follow-up and keep a complete history.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          + Add Follow-up
        </button>
      </div>

      {nextFollowUp ? (
        <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Next Follow-up
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            <p
              className={`text-sm font-semibold ${
                getFollowUpTiming(nextFollowUp).className
              }`}
            >
              {getFollowUpTiming(nextFollowUp).label}
            </p>

            <span className="text-sm text-slate-500">
              {formatDate(
                nextFollowUp.follow_up_date,
              )}
            </span>
          </div>

          {nextFollowUp.notes && (
            <p className="mt-2 text-sm text-slate-600">
              {nextFollowUp.notes}
            </p>
          )}
        </div>
      ) : (
        <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-700">
            No follow-up planned
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Add a follow-up whenever you need to contact
            the employer.
          </p>
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-5 rounded-lg border border-slate-200 p-5"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-slate-900">
              {editingId
                ? "Edit Follow-up"
                : "Add Follow-up"}
            </h3>

            <button
              type="button"
              onClick={resetForm}
              className="text-sm text-slate-500 hover:text-slate-900"
            >
              Cancel
            </button>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Follow-up Date
              </label>

              <input
                type="date"
                value={date}
                onChange={(event) =>
                  setDate(event.target.value)
                }
                required
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Status
              </label>

              <select
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value as
                      | "Planned"
                      | "Completed",
                  )
                }
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5"
              >
                <option value="Planned">
                  Planned
                </option>
                <option value="Completed">
                  Completed
                </option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700">
              Notes
            </label>

            <textarea
              value={notes}
              onChange={(event) =>
                setNotes(event.target.value)
              }
              rows={4}
              placeholder="What did you do or what do you plan to do?"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5"
            />
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              {editingId
                ? "Save Changes"
                : "Add Follow-up"}
            </button>
          </div>
        </form>
      )}

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-slate-900">
          Follow-up History
        </h3>

        {loading ? (
          <p className="mt-4 text-sm text-slate-500">
            Loading follow-ups...
          </p>
        ) : sortedFollowUps.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">
            No follow-ups recorded yet.
          </p>
        ) : (
          <div className="mt-4 divide-y divide-slate-200 rounded-lg border border-slate-200">
            {sortedFollowUps.map((followUp) => {
              const timing =
                getFollowUpTiming(followUp);

              return (
                <div
                  key={followUp.id}
                  className="p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-slate-900">
                          {formatDate(
                            followUp.follow_up_date,
                          )}
                        </p>

                        <span
                          className={`text-sm font-medium ${timing.className}`}
                        >
                          {timing.label}
                        </span>
                      </div>

                      {followUp.notes && (
                        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                          {followUp.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          startEditing(followUp)
                        }
                        className="text-sm font-medium text-slate-600 hover:text-slate-900"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(followUp.id)
                        }
                        className="text-sm font-medium text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}