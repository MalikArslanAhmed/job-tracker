"use client";

import { useState } from "react";

export default function SendDueFollowUpsButton() {
  const [sending, setSending] = useState(false);

  async function handleSend() {
    if (
      !window.confirm(
        "Send all due and overdue follow-up emails now?",
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
            action: "send_due",
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
          "Failed to send due follow-ups.",
        );
      }
      const skippedMessage =
        data.skippedDetails &&
          data.skippedDetails.length > 0
          ? `\n\nSkipped:\n- ${data.skippedDetails.join(
            "\n- ",
          )}`
          : "";

      alert(
        `Follow-ups sent: ${data.sent}\nSkipped: ${data.skipped}${skippedMessage}`,
      );

      window.location.reload();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to send due follow-ups.",
      );

      setSending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleSend}
      disabled={sending}
      className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {sending
        ? "Sending..."
        : "Send Due Follow-ups"}
    </button>
  );
}
