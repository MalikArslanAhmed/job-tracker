"use client";

import { useEffect, useState } from "react";
import SendFollowUpButton from "@/app/follow-ups/SendFollowUpButton";

type FollowUp = {
  id: number;
  application_id: number;
  follow_up_number: number;
  follow_up_date: string;
  status: "Planned" | "Sent" | "Cancelled";
  response_status: "Waiting" | "Received" | "No Response";
  sent_at: string | null;
  email_to: string | null;
  email_subject: string | null;
  email_message: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type FollowUpsProps = {
  applicationId: number;
};

function getToday() {
  const today = new Date();

  return `${today.getFullYear()}-${String(
    today.getMonth() + 1,
  ).padStart(2, "0")}-${String(
    today.getDate(),
  ).padStart(2, "0")}`;
}

function getFollowUpTiming(followUpDate: string) {
  const today = new Date();

  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const followUp = new Date(
    `${followUpDate}T00:00:00`,
  );

  const differenceMs =
    followUp.getTime() - todayStart.getTime();

  const differenceDays = Math.round(
    differenceMs / (1000 * 60 * 60 * 24),
  );

  if (differenceDays < 0) {
    const daysOverdue = Math.abs(differenceDays);

    return {
      label:
        daysOverdue === 1
          ? "Overdue by 1 day"
          : `Overdue by ${daysOverdue} days`,
      className: "bg-red-50 text-red-700",
    };
  }

  if (differenceDays === 0) {
    return {
      label: "Follow up today",
      className: "bg-amber-50 text-amber-700",
    };
  }

  if (differenceDays === 1) {
    return {
      label: "Follow up tomorrow",
      className: "bg-amber-50 text-amber-700",
    };
  }

  return {
    label: `Follow up in ${differenceDays} days`,
    className: "bg-emerald-50 text-emerald-700",
  };
}
export default function FollowUps({
  applicationId,
}: FollowUpsProps) {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [followUpNumber, setFollowUpNumber] = useState(1);
  const [followUpDate, setFollowUpDate] = useState("");
  const [status, setStatus] =
    useState<FollowUp["status"]>("Planned");
  const [responseStatus, setResponseStatus] =
    useState<FollowUp["response_status"]>("Waiting");
  const [notes, setNotes] = useState("");

  async function loadFollowUps() {
    try {
      const response = await fetch(
        `/api/follow-ups?applicationId=${applicationId}`,
        {
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to load follow-ups");
      }

      const data = await response.json();
      setFollowUps(data);
    } catch (error) {
      console.error(error);
      alert("Failed to load follow-ups.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFollowUps();
  }, [applicationId]);
  const getNextFollowUpNumber = () => {
    if (followUps.length === 0) {
      return 1;
    }

    return (
      Math.max(
        ...followUps.map((followUp) => followUp.follow_up_number),
      ) + 1
    );
  };
  function resetForm() {
    setFollowUpNumber(getNextFollowUpNumber());
    setFollowUpDate("");
    setStatus("Planned");
    setResponseStatus("Waiting");
    setNotes("");
    setEditingId(null);
    setShowAddForm(false);
  }

  function startEdit(followUp: FollowUp) {
    setEditingId(followUp.id);
    setFollowUpDate(followUp.follow_up_date);
    setStatus(followUp.status);
    setResponseStatus(followUp.response_status);
    setNotes(followUp.notes ?? "");
    setShowAddForm(false);
  }

  async function handleSave() {
    if (!followUpDate) {
      alert("Please select a follow-up date.");
      return;
    }

    if (!editingId && followUpNumber < 1) {
      alert("Follow-up number must be at least 1.");
      return;
    }

    try {
      const body = editingId
        ? {
          id: editingId,
          follow_up_date: followUpDate,
          status,
          response_status: responseStatus,
          notes,
        }
        : {
          application_id: applicationId,
          follow_up_number: followUpNumber,
          follow_up_date: followUpDate,
          status,
          response_status: responseStatus,
          notes,
        };

      const response = await fetch("/api/follow-ups", {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to save follow-up",
        );
      }

      resetForm();
      await loadFollowUps();
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to save follow-up.",
      );
    }
  }

  async function handleDelete(followUpId: number) {
    if (
      !window.confirm(
        "Are you sure you want to delete this follow-up?",
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/follow-ups?id=${followUpId}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to delete follow-up",
        );
      }

      await loadFollowUps();
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete follow-up.",
      );
    }
  }

  async function updateResponseStatus(
    followUpId: number,
    newResponseStatus: FollowUp["response_status"],
  ) {
    try {
      let action:
        | "response_received"
        | "no_response";

      if (newResponseStatus === "Received") {
        action = "response_received";
      } else if (newResponseStatus === "No Response") {
        action = "no_response";
      } else {
        return;
      }

      const response = await fetch("/api/follow-ups", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: followUpId,
          action,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to update response status",
        );
      }

      await loadFollowUps();
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to update response status.",
      );
    }
  }

  const plannedFollowUps = followUps
    .filter((followUp) => followUp.status === "Planned")
    .sort(
      (a, b) =>
        new Date(a.follow_up_date).getTime() -
        new Date(b.follow_up_date).getTime(),
    );

  const nextFollowUp = plannedFollowUps[0] ?? null;

  const otherPlannedFollowUps = plannedFollowUps.slice(1);

  const history = followUps
    .filter((followUp) => followUp.status !== "Planned")
    .sort(
      (a, b) =>
        new Date(b.follow_up_date).getTime() -
        new Date(a.follow_up_date).getTime(),
    );

  if (loading) {
    return (
      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">
          Loading follow-ups...
        </p>
      </section>
    );
  }

  return (
    <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Follow-ups
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage planned follow-ups and follow-up history.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            resetForm();
            setShowAddForm(true);
          }}
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          Add Follow-up
        </button>
      </div>

      {showAddForm && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">
            Add Follow-up
          </h3>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Follow-up Number
              </label>

              <input
                type="number"
                min="1"
                value={followUpNumber}
                onChange={(event) =>
                  setFollowUpNumber(
                    Number(event.target.value),
                  )
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
              />

              <p className="mt-1 text-xs text-slate-500">
                Choose the follow-up number manually.
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Follow-up Date
              </label>

              <input
                type="date"
                value={followUpDate}
                onChange={(event) =>
                  setFollowUpDate(event.target.value)
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Status
              </label>

              <select
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value as FollowUp["status"],
                  )
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
              >
                <option value="Planned">Planned</option>
                <option value="Sent">Sent</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Response Status
              </label>

              <select
                value={responseStatus}
                onChange={(event) =>
                  setResponseStatus(
                    event.target
                      .value as FollowUp["response_status"],
                  )
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
              >
                <option value="Waiting">Waiting</option>
                <option value="Received">Received</option>
                <option value="No Response">
                  No Response
                </option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Notes
              </label>

              <input
                type="text"
                value={notes}
                onChange={(event) =>
                  setNotes(event.target.value)
                }
                placeholder="Optional notes"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
              />
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              Add Follow-up
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {editingId !== null && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">
            Edit Follow-up
          </h3>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Follow-up Number
              </label>

              <input
                type="number"
                value={
                  followUps.find(
                    (followUp) =>
                      followUp.id === editingId,
                  )?.follow_up_number ?? 1
                }
                disabled
                className="w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-500"
              />

              <p className="mt-1 text-xs text-slate-500">
                Follow-up number cannot be changed when editing.
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Follow-up Date
              </label>

              <input
                type="date"
                value={followUpDate}
                onChange={(event) =>
                  setFollowUpDate(event.target.value)
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Status
              </label>

              <select
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value as FollowUp["status"],
                  )
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
              >
                <option value="Planned">Planned</option>
                <option value="Sent">Sent</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Response Status
              </label>

              <select
                value={responseStatus}
                onChange={(event) =>
                  setResponseStatus(
                    event.target
                      .value as FollowUp["response_status"],
                  )
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
              >
                <option value="Waiting">Waiting</option>
                <option value="Received">Received</option>
                <option value="No Response">
                  No Response
                </option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Notes
              </label>

              <input
                type="text"
                value={notes}
                onChange={(event) =>
                  setNotes(event.target.value)
                }
                placeholder="Optional notes"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
              />
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              Save Changes
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {nextFollowUp ? (
        <div className="mb-8 rounded-xl border border-slate-200 p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900">
                  Next Follow-up
                </h3>

                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                  #{nextFollowUp.follow_up_number}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                <span className="text-slate-600">
                  Scheduled for{" "}
                  <span className="font-medium text-slate-900">
                    {new Date(
                      `${nextFollowUp.follow_up_date}T00:00:00`,
                    ).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </span>

                {(() => {
                  const timing = getFollowUpTiming(
                    nextFollowUp.follow_up_date,
                  );

                  return (
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${timing.className}`}
                    >
                      {timing.label}
                    </span>
                  );
                })()}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <SendFollowUpButton
                followUpId={nextFollowUp.id}
              />

              <button
                type="button"
                onClick={() => startEdit(nextFollowUp)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Edit
              </button>

              <button
                type="button"
                onClick={() =>
                  handleDelete(nextFollowUp.id)
                }
                className="rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
            <p>
              Response status:{" "}
              <span className="font-medium text-slate-900">
                {nextFollowUp.response_status}
              </span>
            </p>

            {nextFollowUp.notes && (
              <p className="mt-2">
                Notes:{" "}
                <span className="text-slate-900">
                  {nextFollowUp.notes}
                </span>
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="mb-8 rounded-xl border border-dashed border-slate-300 p-6 text-center">
          <p className="text-sm font-medium text-slate-700">
            No planned follow-ups.
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Add a follow-up manually if needed.
          </p>
        </div>
      )}

      {otherPlannedFollowUps.length > 0 && (
        <div className="mb-8">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            Other Planned Follow-ups
          </h3>

          <div className="space-y-4">
            {otherPlannedFollowUps.map((followUp) => (
              <div
                key={followUp.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-slate-900">
                        Follow-up #{followUp.follow_up_number}
                      </h4>

                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                        Planned
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                      <span className="text-gray-600">
                        Scheduled for{" "}
                        {new Date(
                          `${followUp.follow_up_date}T00:00:00`,
                        ).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>

                      {(() => {
                        const timing = getFollowUpTiming(
                          followUp.follow_up_date,
                        );

                        return (
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${timing.className}`}
                          >
                            {timing.label}
                          </span>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <SendFollowUpButton
                      followUpId={followUp.id}
                    />

                    <button
                      type="button"
                      onClick={() => startEdit(followUp)}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(followUp.id)
                      }
                      className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="mt-4 text-sm text-gray-600">
                  <p>
                    Response status:{" "}
                    <span className="text-slate-900">
                      {followUp.response_status}
                    </span>
                  </p>

                  {followUp.notes && (
                    <p className="mt-1">
                      Notes:{" "}
                      <span className="text-slate-900">
                        {followUp.notes}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-4 text-base font-semibold text-slate-900">
          Follow-up History
        </h3>

        {history.length === 0 ? (
          <p className="text-sm text-slate-500">
            No follow-up history yet.
          </p>
        ) : (
          <div className="space-y-3">
            {history.map((followUp) => (
              <div
                key={followUp.id}
                className="rounded-xl border border-slate-200 p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-slate-900">
                        Follow-up #{followUp.follow_up_number}
                      </span>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${followUp.status === "Sent"
                          ? "bg-green-50 text-green-700"
                          : "bg-slate-100 text-slate-600"
                          }`}
                      >
                        {followUp.status}
                      </span>

                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        {followUp.response_status}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-500">
                      {new Date(
                        `${followUp.follow_up_date}T00:00:00`,
                      ).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>

                    {followUp.sent_at && (
                      <p className="mt-1 text-xs text-slate-400">
                        Sent:{" "}
                        {new Date(
                          followUp.sent_at,
                        ).toLocaleString("en-GB")}
                      </p>
                    )}

                    {followUp.email_to && (
                      <p className="mt-2 text-sm text-slate-600">
                        To:{" "}
                        <span className="text-slate-900">
                          {followUp.email_to}
                        </span>
                      </p>
                    )}

                    {followUp.email_subject && (
                      <p className="mt-1 text-sm text-slate-600">
                        Subject:{" "}
                        <span className="text-slate-900">
                          {followUp.email_subject}
                        </span>
                      </p>
                    )}

                    {followUp.notes && (
                      <p className="mt-2 text-sm text-slate-600">
                        Notes:{" "}
                        <span className="text-slate-900">
                          {followUp.notes}
                        </span>
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {followUp.status === "Sent" &&
                      followUp.response_status ===
                      "Waiting" && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              updateResponseStatus(
                                followUp.id,
                                "Received",
                              )
                            }
                            className="rounded-lg border border-green-200 bg-white px-3 py-2 text-xs font-medium text-green-700 hover:bg-green-50"
                          >
                            Mark Received
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              updateResponseStatus(
                                followUp.id,
                                "No Response",
                              )
                            }
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            No Response
                          </button>
                        </>
                      )}

                    <button
                      type="button"
                      onClick={() => startEdit(followUp)}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(followUp.id)
                      }
                      className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}