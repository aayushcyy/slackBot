# Slack Approval Bot

A Slack bot named as Approved that allows users to request approvals via a slash command(/approval-test), with an approver receiving a message to approve or reject the request. Built with Node.js, Express, and the Slack API.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Known Issues](#known-issues)
- [Future Improvements](#future-improvements)
- [License](#license)

## Overview

This project is a Slack bot that enables users to request approvals using the `/approval-test` slash command. The bot opens a modal for the requester to select an approver and enter request details. The approver receives a message with "Approve" and "Reject" buttons, and the requester is notified of the decision via a direct message or channel notification.

The bot is built using Node.js and Express, with the Slack Bolt API for interacting with Slack. It includes request verification for security and is deployed on Render.

## Features

- **Slash Command**: Use `/approval-test` to initiate an approval request.
- **Modal Interface**: A modal prompts the requester to select an approver and enter request details.
- **Approval Workflow**: The approver receives a message with "Approve" and "Reject" buttons.
- **Notifications**: The requester is notified of the approval result via a direct message (or channel as a fallback).
- **Security**: Verifies Slack requests using the Signing Secret to prevent unauthorized access.
- **Error Handling**: Includes basic error handling for invalid requests and server errors.

## Prerequisites

- **Node.js**: Version 14.x or higher.
- **Slack App**: A Slack app with a bot token and Signing Secret.
- **Slack Workspace**: A workspace where you have permission to install the app.
- **Render Account**: For deployment (optional, can run locally).

## Setup

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd slack-approval-bot
   ```
