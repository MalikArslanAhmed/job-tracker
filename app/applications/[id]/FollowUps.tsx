"use client";

import { useEffect, useState } from "react";

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

export default function FollowUps({
  applicationId,
}: FollowUpsProps) {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);

  const [sendingId, setSendingId] = useState<number | null>(
    null,
  );

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(
    null,
  );

  const [followUpNumber, setFollowUpNumber] = useState("1");
  const [followUpDate, setFollowUpDate] = useState("");
  const [status, setStatus] = useState<
    "Planned" | "Sent" | "Cancelled"
  >("Planned");
  const [responseStatus, setResponseStatus] = useState<
    "Waiting" | "Received" | "No Response"
  >("Waiting");
  const [notes, setNotes] = useState("");

  const [saving, setSaving] = useState(false);

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
    setFollowUpNumber("1");
    setFollowUpDate("");
    setStatus("Planned");
    setResponseStatus("Waiting");
    setNotes("");
    setEditingId(null);
    setShowForm(false);
  }

  function openAddForm() {
    const highestNumber =
      followUps.length > 0
        ? Math.max(
            ...followUps.map(
              (followUp) =>
                followUp.follow_up_number,
            ),
          )
        : 0;

    setFollowUpNumber(String(highestNumber + 1));
    setFollowUpDate("");
    setStatus("Planned");
    setResponseStatus("Waiting");
    setNotes("");
    setEditingId(null);
    setShowForm(true);
  }

  function openEditForm(followUp: FollowUp) {
    setFollowUpNumber(
      String(followUp.follow_up_number),
    );
    setFollowUpDate(followUp.follow_up_date);
    setStatus(followUp.status);
    setResponseStatus(followUp.response_status);
    setNotes(followUp.notes || "");
    setEditingId(followUp.id);
    setShowForm(true);
  }

  async function handleSave() {
    if (!followUpDate) {
      alert("Please select a follow-up date.");
      return;
    }

    setSaving(true);

    try {
      const isEditing = editingId !== null;

      const response = await fetch(
        "/api/follow-ups",
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            isEditing
              ? {
                  id: editingId,
                  follow_up_date: followUpDate,
                  status,
                  response_status: responseStatus,
                  notes: notes || null,
                }
              : {
                  application_id: applicationId,
                  follow_up_number:
                    Number(followUpNumber),
                  follow_up_date: followUpDate,
                  status,
                  response_status: responseStatus,
                  notes: notes || null,
                },
          ),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to save follow-up.",
        );
      }

      resetForm();
      await loadFollowUps();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to save follow-up.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(
    followUpId: number,
  ) {
    if (
      !window.confirm(
        "Delete this follow-up?",
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
          data.error ||
            "Failed to delete follow-up.",
        );
      }

      if (editingId === followUpId) {
        resetForm();
      }

      await loadFollowUps();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete follow-up.",
      );
    }
  }

  async function handleSend(
    followUpId: number,
  ) {
    if (
      !window.confirm(
        "Send this follow-up email now?",
      )
    ) {
      return;
    }

    setSendingId(followUpId);

    try {
      const response = await fetch(
        "/api/follow-ups",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: followUpId,
            action: "send",
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to send follow-up.",
        );
      }

      await loadFollowUps();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to send follow-up.",
      );
    } finally {
      setSendingId(null);
    }
  }

  function formatDate(value: string) {
    const dateValue = new Date(
      `${value}T00:00:00`,
    );

    return dateValue.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatSentDate(
    value: string | null,
  ) {
    if (!value) {
      return null;
    }

    const dateValue = new Date(
      value.replace(" ", "T"),
    );

    return dateValue.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getFollowUpTiming(
    followUp: FollowUp,
  ) {
    if (followUp.status === "Sent") {
      return {
        label: "Sent",
        className: "text-emerald-600",
      };
    }

    if (followUp.status === "Cancelled") {
      return {
        label: "Cancelled",
        className: "text-slate-500",
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
      followUpDate.getTime() -
      todayStart.getTime();

    const differenceDays = Math.ceil(
      differenceMs /
        (1000 * 60 * 60 * 24),
    );

    if (differenceDays < 0) {
      const daysOverdue =
        Math.abs(differenceDays);

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
        label: "Due today",
        className: "text-amber-600",
      };
    }

    if (differenceDays === 1) {
      return {
        label: "Due tomorrow",
        className: "text-amber-600",
      };
    }

    return {
      label: `Due in ${differenceDays} days`,
      className: "text-emerald-600",
    };
  }

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

  const history = [...followUps]
    .filter(
      (followUp) =>
        followUp.status !== "Planned",
    )
    .sort((a, b) => {
      if (
        a.follow_up_number !==
        b.follow_up_number
      ) {
        return (
          b.follow_up_number -
          a.follow_up_number
        );
      }

      return b.id - a.id;
    });

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Follow-ups
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Follow-ups are planned automatically and sent manually.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          + Add Follow-up
        </button>
      </div>

      {showForm && (
        <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-900">
            {editingId !== null
              ? "Edit Follow-up"
              : "Add Follow-up"}
          </h3>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Follow-up Number
              </label>

              <input
                type="number"
                min="1"
                value={followUpNumber}
                onChange={(event) =>
                  setFollowUpNumber(
                    event.target.value,
                  )
                }
                disabled={editingId !== null}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Follow-up Date
              </label>

              <input
                type="date"
                value={followUpDate}
                onChange={(event) =>
                  setFollowUpDate(
                    event.target.value,
                  )
                }
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
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
                      | "Sent"
                      | "Cancelled",
                  )
                }
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
              >
                <option value="Planned">
                  Planned
                </option>
                <option value="Sent">
                  Sent
                </option>
                <option value="Cancelled">
                  Cancelled
                </option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Response Status
              </label>

              <select
                value={responseStatus}
                onChange={(event) =>
                  setResponseStatus(
                    event.target.value as
                      | "Waiting"
                      | "Received"
                      | "No Response",
                  )
                }
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
              >
                <option value="Waiting">
                  Waiting
                </option>
                <option value="Received">
                  Received
                </option>
                <option value="No Response">
                  No Response
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
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
              placeholder="Optional notes"
            />
          </div>

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingId !== null
                  ? "Save Changes"
                  : "Add Follow-up"}
            </button>

            <button
              type="button"
              onClick={resetForm}
              disabled={saving}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="mt-5 text-sm text-slate-500">
          Loading follow-ups...
        </p>
      ) : (
        <>
          {nextFollowUp ? (
            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Next Follow-up
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
                <p className="font-semibold text-slate-900">
                  Follow-up #
                  {nextFollowUp.follow_up_number}
                </p>

                <span className="text-sm text-slate-500">
                  {formatDate(
                    nextFollowUp.follow_up_date,
                  )}
                </span>

                <span
                  className={`text-sm font-medium ${
                    getFollowUpTiming(
                      nextFollowUp,
                    ).className
                  }`}
                >
                  {
                    getFollowUpTiming(
                      nextFollowUp,
                    ).label
                  }
                </span>
              </div>

              {nextFollowUp.notes && (
                <p className="mt-3 text-sm text-slate-600">
                  {nextFollowUp.notes}
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() =>
                    handleSend(
                      nextFollowUp.id,
                    )
                  }
                  disabled={
                    sendingId ===
                    nextFollowUp.id
                  }
                  className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sendingId ===
                  nextFollowUp.id
                    ? "Sending..."
                    : "Send Follow-up"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    openEditForm(
                      nextFollowUp,
                    )
                  }
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleDelete(
                      nextFollowUp.id,
                    )
                  }
                  className="rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-700">
                No follow-up planned
              </p>

              <p className="mt-1 text-sm text-slate-500">
                You can add a follow-up manually.
              </p>
            </div>
          )}

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-slate-900">
              Follow-up History
            </h3>

            {history.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">
                No follow-ups have been sent or cancelled yet.
              </p>
            ) : (
              <div className="mt-4 divide-y divide-slate-200 rounded-lg border border-slate-200">
                {history.map((followUp) => (
                  <div
                    key={followUp.id}
                    className="p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-slate-900">
                            Follow-up #
                            {followUp.follow_up_number}
                          </p>

                          <span
                            className={`text-sm font-medium ${
                              followUp.status ===
                              "Sent"
                                ? "text-emerald-600"
                                : "text-slate-500"
                            }`}
                          >
                            {followUp.status}
                          </span>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                          Planned for{" "}
                          {formatDate(
                            followUp.follow_up_date,
                          )}
                        </p>

                        {followUp.sent_at && (
                          <p className="mt-1 text-sm text-slate-500">
                            Sent{" "}
                            {formatSentDate(
                              followUp.sent_at,
                            )}
                          </p>
                        )}

                        {followUp.email_to && (
                          <p className="mt-2 text-sm text-slate-600">
                            To: {followUp.email_to}
                          </p>
                        )}

                        {followUp.email_subject && (
                          <p className="mt-1 text-sm text-slate-600">
                            Subject:{" "}
                            {followUp.email_subject}
                          </p>
                        )}

                        <p className="mt-1 text-sm text-slate-500">
                          Response:{" "}
                          {followUp.response_status}
                        </p>

                        {followUp.notes && (
                          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                            {followUp.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            openEditForm(
                              followUp,
                            )
                          }
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              followUp.id,
                            )
                          }
                          className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
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
        </>
      )}
    </section>
  );
}