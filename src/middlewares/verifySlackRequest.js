// library for generating HMAC signature
import crypto from "crypto";

// middleware that verifies slack requests using signing secret
const verifySlackRequest = (req, res, next) => {
  const slackSignature = req.headers["x-slack-signature"];
  const timestamp = req.headers["x-slack-request-timestamp"];

  // checking required slack header
  if (!slackSignature || !timestamp) {
    return res.status(400).send("Missing Slack headers");
  }

  // validating request timestamps (must be within 5mins)
  const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 300;
  if (timestamp < fiveMinutesAgo) {
    return res.status(400).send("Request timestamp too old");
  }

  // Ensuring req.body is a Buffer (from express.raw)
  if (!Buffer.isBuffer(req.body)) {
    return res.status(400).send("Invalid request body format");
  }

  // Convert the raw body Buffer to a string
  const rawBody = req.body.toString("utf8");

  // Create signature base string of version 0 (v0) as slack uses version 0 HMAC signature
  const sigBaseString = `v0:${timestamp}:${rawBody}`;

  // generating hmac signature using singing secret
  const hmac = crypto.createHmac("sha256", process.env.SLACK_SIGNING_SECRET);
  hmac.update(sigBaseString);
  const mySignature = `v0=${hmac.digest("hex")}`;

  // verifying the generated signature matches Slack's signature
  if (
    !crypto.timingSafeEqual(
      Buffer.from(mySignature),
      Buffer.from(slackSignature)
    )
  ) {
    return res.status(400).send("Verification failed");
  }

  // proceed to next middleware/controller
  next();
};

export { verifySlackRequest };
