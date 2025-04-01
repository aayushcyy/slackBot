import crypto from "crypto";

const verifySlackRequest = (req, res, next) => {
  const slackSignature = req.headers["x-slack-signature"];
  const requestBody = JSON.stringify(req.body, null, 2);
  const timestamp = req.headers["x-slack-request-timestamp"];
  const sigBaseString = `v0:${timestamp}:${requestBody}`;
  const hmac = crypto.createHmac("sha256", process.env.SLACK_SIGNING_SECRET);
  hmac.update(sigBaseString);
  const mySignature = `v0=${hmac.digest("hex")}`;
  if (
    crypto.timingSafeEqual(
      Buffer.from(mySignature),
      Buffer.from(slackSignature)
    )
  ) {
    next();
  } else {
    return res.status(400).send("Verification failed");
  }
};

export { verifySlackRequest };
