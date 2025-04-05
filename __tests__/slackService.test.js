import { sendSlackMessage } from "../services/slackService.js";
import axios from "axios";

// Mock axios
jest.mock("axios");

describe("sendSlackMessage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SLACK_BOT_TOKEN = "test-bot-token"; // test token for API calls
  });

  // test - 1: verify correct msg sending
  test("should send a Slack message successfully", async () => {
    const mockResponse = { data: { ok: true } };
    axios.post.mockResolvedValue(mockResponse);

    const result = await sendSlackMessage("U123", "✅ Request Approved!");

    expect(axios.post).toHaveBeenCalledWith(
      "https://slack.com/api/chat.postMessage",
      {
        channel: "U123",
        text: "✅ Request Approved!",
      },
      {
        headers: {
          Authorization: "Bearer test-bot-token",
          "Content-Type": "application/json",
        },
      }
    );
    expect(result).toEqual(mockResponse.data);
  });

  // test - 2: handle API call errors
  test("should throw an error if Slack API call fails", async () => {
    const mockError = new Error("Network error");
    axios.post.mockRejectedValue(mockError);

    await expect(sendSlackMessage("U123", "Test message")).rejects.toThrow(
      "Slack API error: Network error"
    );
  });
});
