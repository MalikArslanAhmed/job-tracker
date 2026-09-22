"use client";

import { useState } from "react";

type Props = {
  followUpId: number;
};

export default function SendFollowUpButton({
  followUpId,
}: Props) {
  const [sending, setSending] = useState(false);

  async function handleSend() {
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
    <button
      type="button"
      onClick={handleSend}
      disabled={sending}
      className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {sending ? "Sending..." : "Send Follow-up"}
    </button>
  );
}
