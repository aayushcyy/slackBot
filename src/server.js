import express from "express";
import "dotenv/config";
import bodyParser from "body-parser";
import slackEventRouter from "./routes/slack.route.js";

const app = express();
// enabeling json parsing
app.use(express.json());

// middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// slack event subscription route
app.use("/", slackEventRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
