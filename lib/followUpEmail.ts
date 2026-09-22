type FollowUpEmailData = {
  company: string;
  jobTitle: string;
  contactPerson: string | null;
  followUpNumber: number;
};

export function createFollowUpEmail({
  company,
  jobTitle,
  contactPerson,
  followUpNumber,
}: FollowUpEmailData) {
  const greeting = contactPerson
    ? `Dear ${contactPerson},`
    : "Dear Hiring Team,";

  const subject =
    followUpNumber === 1
      ? `Following up on my application – ${jobTitle}`
      : `Follow-up ${followUpNumber} – ${jobTitle}`;

  const message = `${greeting}

I hope you are well.

I am writing to follow up on my application for the ${jobTitle} position at ${company}. I submitted my application recently and wanted to kindly ask if there have been any updates regarding its progress.

I remain very interested in the opportunity and would be grateful for any information you can share regarding the next steps in the recruitment process.

Thank you for your time and consideration. I look forward to hearing from you.

Kind regards,
Arslan Ahmed`;

  return {
    subject,
    message,
  };
}
