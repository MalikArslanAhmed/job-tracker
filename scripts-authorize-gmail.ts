import { google } from "googleapis";
import fs from "fs";
import path from "path";
import readline from "readline";

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

const { client_id, client_secret, redirect_uris } =
  credentials.installed;

const oauth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0],
);

const scopes = [
  "https://www.googleapis.com/auth/gmail.send",
];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: scopes,
  prompt: "consent",
});

console.log("\nOpen this URL in your browser:\n");
console.log(authUrl);
console.log("\n");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question(
  "Paste the authorization code here: ",
  async (code) => {
    try {
      const { tokens } =
        await oauth2Client.getToken(code);

      fs.writeFileSync(
        tokenPath,
        JSON.stringify(tokens, null, 2),
      );

      console.log(
        "\nGmail authorization successful.",
      );

      console.log(
        `Token saved to: ${tokenPath}`,
      );

      rl.close();
    } catch (error) {
      console.error(
        "\nAuthorization failed:",
        error,
      );

      rl.close();
      process.exit(1);
    }
  },
);
