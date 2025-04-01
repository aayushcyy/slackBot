const slackEventController = async (req, res) => {
  const { type, challenge } = req.body;

  // Handling slack verification challenge
  if (type === "url_verification") {
    return res.status(200).send({ challenge });
  }

  // handling other event types
  return res.status(200).send("Event received!");
};

export { slackEventController };
