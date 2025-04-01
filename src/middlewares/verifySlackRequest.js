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

  // Convert Buffer body to string
  const rawBody = req.body.toString();

  // Create signature base string
  const sigBaseString = `v0:${timestamp}:${rawBody}`;

  const hmac = crypto.createHmac("sha256", process.env.SLACK_SIGNING_SECRET);
  hmac.update(sigBaseString);
  const mySignature = `v0=${hmac.digest("hex")}`;

  if (
    !crypto.timingSafeEqual(
      Buffer.from(mySignature),
      Buffer.from(slackSignature)
    )
  ) {
    return res.status(400).send("Verification failed");
  }

  next();
};

export { verifySlackRequest };
