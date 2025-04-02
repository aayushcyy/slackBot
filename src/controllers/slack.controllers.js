import axios from "axios";
import {
  openApprovalModal,
  sendSlackMessage,
} from "../services/slackService.js";

// 1. slack event controller
const slackEventController = async (req, res) => {
  const { type, challenge } = req.body;

  // Handling slack verification challenge
  if (type === "url_verification") {
    return res.status(200).send({ challenge });
  }

  // handling other event types
  return res.status(200).send("Event received!");
};

// 2. slash command controller
const handleSlashCommand = async (req, res) => {
  try {
    console.log("Received Slack command:", req.body);
    const triggerId = req.body.trigger_id;

    if (!triggerId) {
      return res.status(400).send("Missing trigger_id from Slack request");
    }
    console.log("2. Slash command received:", req.body);
    res.status(200).send("Processing your request...");

    // open slack model
    await openApprovalModal(triggerId);

    return res.status(200).send();
  } catch (error) {
    console.log(`Error handling slash command: ${error}`);
    return res.status(500).send("Internal server errror");
  }
};

// 3. handling action after the approver clicks a button
const handleAction = async (req, res) => {
  try {
    const payload = JSON.parse(req.body.payload);
    const action = payload.actions[0].value;
    const requesterId = payload.user.id;

    const message =
      action === "approve" ? "✅ Request Approved!" : "❌ Request Rejected!";

    // Notifying the requester
    await sendSlackMessage(requesterId, message);

    return res.status(200).send();
  } catch (error) {
    console.error("Error handling actions:", error);
    return res.status(500).send("Internal Server Error");
  }
};

export { slackEventController, handleSlashCommand, handleAction };
