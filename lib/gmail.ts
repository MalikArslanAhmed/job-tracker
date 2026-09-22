import { google } from "googleapis";
import fs from "fs";
import path from "path";

const credentialsPath = path.join(
  process.cwd(),
  "credentials",
  "gmail-oauth-client.json",
);

const tokenPath = path.join(
  process.cwd(),
  "credentials",
  "gmail-token.json",
);

const credentials = JSON.parse(
  fs.readFileSync(credentialsPath, "utf-8"),
);

const token = JSON.parse(
  fs.readFileSync(tokenPath, "utf-8"),
);

const { client_id, client_secret, redirect_uris } =
  credentials.installed;

const oauth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0],
);

oauth2Client.setCredentials(token);

export const gmail = google.gmail({
  version: "v1",
  auth: oauth2Client,
});

function encodeMessage(message: string) {
  return Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function sendGmail({
  to,
  subject,
  message,
}: {
  to: string;
  subject: string;
  message: string;
}) {
  const email = [
    "From: arslanahmedofficial44@gmail.com",
    `To: ${to}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString("base64")}?=`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=utf-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    message,
  ].join("\r\n");

  const response = await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: encodeMessage(email),
    },
  });

  return response.data;
}