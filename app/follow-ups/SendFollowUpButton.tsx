"use client";

import { useState } from "react";

type Props = {
  followUpId: number;
};

export default function SendFollowUpButton({
  followUpId,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const [showPreview, setShowPreview] =
    useState(false);

  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  async function handlePreview() {
    setLoading(true);

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
            action: "preview",
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
          "Failed to load email preview.",
        );
      }

      setTo(data.to || "");
      setSubject(data.subject || "");
      setMessage(data.message || "");
      setShowPreview(true);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to load email preview.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSend() {
    if (!to.trim()) {
      alert("Recipient email is required.");
      return;
    }

    if (!subject.trim()) {
      alert("Email subject is required.");
      return;
    }

    if (!message.trim()) {
      alert("Email message is required.");
      return;
    }

    if (
      !window.confirm(
        "Send this follow-up email now?",
      )
    ) {
      return;
    }

    setSending(true);

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
            email_to: to,
            email_subject: subject,
            email_message: message,
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

      window.location.reload();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to send follow-up.",
      );

      setSending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handlePreview}
        disabled={loading || sending}
        className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? "Loading..."
          : "Send Follow-up"}
      </button>

      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Email Preview
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Review and edit the email before
                sending.
              </p>
            </div>

            <div className="space-y-5 p-6">
              {/* Recipient */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  To
                </label>

                <input
                  type="email"
                  value={to}
                  onChange={(event) =>
                    setTo(event.target.value)
                  }
                  disabled={sending}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Subject
                </label>

                <input
                  type="text"
                  value={subject}
                  onChange={(event) =>
                    setSubject(
                      event.target.value,
                    )
                  }
                  disabled={sending}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                />
              </div>

              {/* Message */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Message
                </label>

                <textarea
                  value={message}
                  onChange={(event) =>
                    setMessage(
                      event.target.value,
                    )
                  }
                  disabled={sending}
                  rows={16}
                  className="w-full resize-y rounded-lg border border-slate-300 px-3 py-3 text-sm leading-6 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                onClick={() =>
                  setShowPreview(false)
                }
                disabled={sending}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSend}
                disabled={sending}
                className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending
                  ? "Sending..."
                  : "Send Email"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}