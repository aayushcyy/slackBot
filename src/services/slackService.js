import axios from "axios";

// Opens a modal(form) in Slack for the requester to submit an approval request
const openApprovalModal = async (triggerId, responseUrl) => {
  const modalPayload = {
    trigger_id: triggerId,
    view: {
      type: "modal",
      callback_id: "approval_request",
      private_metadata: JSON.stringify({ response_url: responseUrl }), // storing resposeUrl for later use
      title: { type: "plain_text", text: "Approval Request" },
      blocks: [
        {
          type: "input",
          block_id: "approver",
          label: { type: "plain_text", text: "Select Approver" },
          element: {
            type: "users_select",
            action_id: "approver_selected",
          },
        },
        {
          type: "input",
          block_id: "approval_text",
          label: { type: "plain_text", text: "Approval Request Details" },
          element: {
            type: "plain_text_input",
            action_id: "approval_text_input",
          },
        },
      ],
      submit: { type: "plain_text", text: "Submit" },
    },
  };

  await axios.post("https://slack.com/api/views.open", modalPayload, {
    headers: {
      Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
  });
};

// Sends an approval request to the approver with Approve/Reject buttons
const sendApprovalRequest = async (
  approverId,
  requesterId,
  approvalText,
  responseUrl
) => {
  const messagePayload = {
    channel: approverId,
    text: `Approval request from <@${requesterId}>:\n${approvalText}`,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Approval request from <@${requesterId}>:\n${approvalText}`,
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: { type: "plain_text", text: "Approve" },
            style: "primary",
            value: "approve",
            action_id: "approve_action",
          },
          {
            type: "button",
            text: { type: "plain_text", text: "Reject" },
            style: "danger",
            value: "reject",
            action_id: "reject_action",
          },
        ],
      },
    ],
  };

  const response = await axios.post(
    "https://slack.com/api/chat.postMessage",
    messagePayload,
    {
      headers: {
        Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.data.ok) {
    console.error(
      "Failed to send approval request:",
      response.data.error,
      response.data
    );
    throw new Error(`Failed to send approval request: ${response.data.error}`);
  }

  return { messageTs: response.data.ts, responseUrl }; // Returns message timestamp for later use
};

// Sends a direct message to a Slack user (e.g., to notify the requester)
const sendSlackMessage = async (userId, text) => {
  const messagePayload = {
    channel: userId,
    text: text,
  };

  try {
    const response = await axios.post(
      "https://slack.com/api/chat.postMessage",
      messagePayload,
      {
        headers: {
          Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data.ok) {
      console.error(
        "Failed to send Slack message:",
        response.data.error,
        response.data
      );
      throw new Error(`Failed to send Slack message: ${response.data.error}`);
    }

    console.log(`Successfully sent message to user ${userId}`);
  } catch (error) {
    console.error(`Error sending Slack message to ${userId}:`, error.message);
    throw error;
  }
};

export { openApprovalModal, sendSlackMessage, sendApprovalRequest };
