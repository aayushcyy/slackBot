import axios from "axios";
import querystring from "querystring";
import {
  openApprovalModal,
  sendSlackMessage,
  sendApprovalRequest,
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
    console.log("Received Slack command:", JSON.stringify(req.body, null, 2));

    // operation here
    const parsedBody = querystring.parse(req.body.toString());
    console.log("body is being parsed: ", parsedBody);

    const triggerId = req.body.trigger_id;
    const responseUrl = req.body.response_url;

    if (!triggerId) {
      return res.status(400).send("Missing trigger_id from Slack request");
    }

    console.log("2. Slash command received:", req.body);

    res.status(200).send("Processing your request...");

    // open slack model
    await openApprovalModal(triggerId, responseUrl);

    return res.status(200).send();
  } catch (error) {
    console.log(`Error handling slash command: ${error}`);
    return res.status(500).send("Internal server errror");
  }
};

// 3. handling action after the approver clicks a button
const handleAction = async (req, res) => {
  try {
    // log only for production
    console.log("11. Received action payload:", req.body);

    const payload = JSON.parse(req.body.payload);

    // logs only for production
    console.log("Parsed payload:", payload);

    // Handle modal submission
    if (payload.type === "view_submission") {
      // Extract data from the modal
      const values = payload.view.state.values;
      const approverId = values.approver.approver_selected.selected_user;
      const approvalText = values.approval_text.approval_text_input.value;
      const requesterId = payload.user.id;
      const responseUrl = JSON.parse(
        payload.view.private_metadata
      ).response_url;

      // Send the approval request to the approver
      const { messageTs, responseUrl: returnedResponseUrl } =
        await sendApprovalRequest(
          approverId,
          requesterId,
          approvalText,
          responseUrl
        );

      // Acknowledge the modal submission to Slack
      return res.status(200).json({
        response_action: "clear", // Closes the modal
      });
    }

    // Handle button actions (Approve/Reject)
    if (payload.type === "block_actions") {
      if (
        !payload.actions ||
        !Array.isArray(payload.actions) ||
        payload.actions.length === 0
      ) {
        console.error("22. Error: No actions found in payload.");
        return res.status(400).send("Invalid payload: No actions found.");
      }

      const action = payload.actions[0].value;
      console.log("Processing action:", action);

      const approverId = payload.user.id;
      const requesterId = payload.message.text.match(/<@(.+?)>/)[1];
      const responseUrl = payload.response_url;

      const message =
        action === "approve" ? "✅ Request Approved!" : "❌ Request Rejected!";

      // Notify the requester
      try {
        await sendSlackMessage(requesterId, message);
      } catch (error) {
        console.error(`Failed to notify requester ${requesterId}:`, error);
        // Fallback: Notify in the channel where the command was run (optional)
        await sendSlackMessage(
          payload.channel.id,
          `Failed to notify <@${requesterId}> directly. Approval result: ${message}`
        );
      }

      // Update the original message in Slack
      await axios.post(responseUrl, {
        replace_original: "true",
        text: `User <@${requesterId}> has ${action}d the request.`,
      });

      await sendSlackMessage(
        "C08KZTK985U", // The channel where the command was run
        `Approval result for <@${requesterId}>: ${message}`
      );

      return res.status(200).send();
    }

    // If the payload type is neither view_submission nor block_actions
    return res.status(400).send("Unsupported payload type");
  } catch (error) {
    console.error("Error handling actions:", error);
    return res.status(500).send("Internal Server Error");
  }
};

export { slackEventController, handleSlashCommand, handleAction };
