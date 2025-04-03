import crypto from "crypto";

const verifySlackRequest = (req, res, next) => {
  const slackSignature = req.headers["x-slack-signature"];
  const timestamp = req.headers["x-slack-request-timestamp"];

  if (!slackSignature || !timestamp) {
    return res.status(400).send("Missing Slack headers");
  }

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

  // Create signature base string
  const sigBaseString = `v0:${timestamp}:${rawBody}`;

  // Log the SLACK_SIGNING_SECRET (partially for security)
  console.log(
    "SLACK_SIGNING_SECRET (first 5 chars):",
    process.env.SLACK_SIGNING_SECRET?.substring(0, 5) || "undefined"
  );

  const hmac = crypto.createHmac("sha256", process.env.SLACK_SIGNING_SECRET);
  hmac.update(sigBaseString);
  const mySignature = `v0=${hmac.digest("hex")}`;

  console.log("Computed signature:", mySignature);
  console.log("Expected signature:", slackSignature);

  if (
    !crypto.timingSafeEqual(
      Buffer.from(mySignature),
      Buffer.from(slackSignature)
    )
  ) {
    console.error("Signature verification failed");
    return res.status(400).send("Verification failed");
  }

  next();
};

export { verifySlackRequest };
