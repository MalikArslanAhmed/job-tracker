import { gmail } from "./lib/gmail";

function encodeMessage(message: string) {
  return Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function testGmail() {
  const message = [
    "From: arslanahmedofficial44@gmail.com",
    "To: arslanahmedofficial44@gmail.com",
    "Subject: Job Tracker Gmail Test",
    "Content-Type: text/plain; charset=utf-8",
    "",
    "This is a test email from the Job Tracker application.",
  ].join("\r\n");

  try {
    const response = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodeMessage(message),
      },
    });

    console.log("\nGmail test email sent successfully.");
    console.log(`Message ID: ${response.data.id}`);
  } catch (error) {
    console.error("\nGmail test failed:", error);
    process.exit(1);
  }
}

testGmail();