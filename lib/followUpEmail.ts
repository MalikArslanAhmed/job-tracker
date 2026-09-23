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

  if (followUpNumber === 1) {
    return {
      subject: `Following up on my application – ${jobTitle}`,
      message: `${greeting}

I hope you are well.

I am writing to follow up on my application for the ${jobTitle} position at ${company}. I submitted my application recently and wanted to kindly ask if there have been any updates regarding its progress.

I remain very interested in the opportunity and would be grateful for any information you can share regarding the next steps in the recruitment process.

Thank you for your time and consideration. I look forward to hearing from you.

Kind regards,
Arslan Ahmed`,
    };
  }

  if (followUpNumber === 2) {
    return {
      subject: `Second follow-up regarding my application – ${jobTitle}`,
      message: `${greeting}

I hope you are well.

I am following up regarding my application for the ${jobTitle} position at ${company}, as I wanted to check whether there have been any updates regarding the recruitment process.

I remain very interested in the opportunity and would appreciate any update you may be able to share.

Thank you for your time and consideration.

Kind regards,
Arslan Ahmed`,
    };
  }

  return {
    subject: `Final follow-up regarding my application – ${jobTitle}`,
    message: `${greeting}

I hope you are well.

I am writing to make a final follow-up regarding my application for the ${jobTitle} position at ${company}.

I remain very interested in the opportunity and would be grateful for any update you may be able to share regarding the recruitment process.

Thank you again for your time and consideration. I look forward to hearing from you.

Kind regards,
Arslan Ahmed`,
  };
}