import express, { Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";
import staticTrafficData from "../staticTrafficData.json";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Generate a simple date string (YYYY-MM-DD)
const now = new Date().toISOString().split("T")[0];

/**
 * GET /integration.json
 * Returns the integration configuration for Telex.
 */
app.get("/integration.json", (req: Request, res: Response) => {
  const trafficRobotConfig = {
    data: {
      date: {
        created_at: now,
        updated_at: now,
      },
      descriptions: {
        app_name: "Traffic Robot 🚦",
        app_description: "Checks road congestion every 10 minutes!",
        app_logo:
          "https://data:image/jpeg;base64,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",
        app_url: "https://integration-ep7w.onrender.com",
        background_color: "#4A90E2",
      },
      is_active: true,
      integration_type: "interval",
      key_features: [
        "Real-time traffic congestion updates 🚦",
        "Automatic rerouting suggestions 🗺️",
        "10-minute interval checks ⏱️",
        "Easy integration with Telex channels 📨",
      ],
      integration_category: "Monitoring & Logging",
      author: "Frank Oguguo",
      settings: [
        {
          label: "Site 1",
          type: "text",
          required: true,
          default: "static-data-route-1",
        },
        {
          label: "Site 2",
          type: "text",
          required: true,
          default: "static-data-route-2",
        },
        {
          label: "Line interval",
          type: "text",
          default: "*/10 * * * *", // Every 10 minutes (cron syntax)
          required: true,
          options: ["daily", "weekly", "monthly"],
        },
      ],
      tick_url: "https://integration-ep7w.onrender.com/tick",
      target_url: "",
    },
  };

  res.json(trafficRobotConfig);
});

/**
 * POST /tick
 * This endpoint is called by Telex at the defined interval.
 * It processes the static traffic data and sends the result to the provided return_url.
 */
app.post("/tick", async (req: Request, res: Response) => {
  try {
    const { return_url } = req.body;

    // Retrieve static data for the route (assumes your JSON structure contains routes)
    const route = staticTrafficData.routes[0];

    // Check if any step indicates congestion
    const hasCongestion = route.legs[0].steps.some(
      (step: { traffic_speed_entry: string[] }) =>
        step.traffic_speed_entry.includes("congestion")
    );

    // Construct a message based on the congestion check
    let message = hasCongestion
      ? "🚨 Highway 5 is blocked! Use Route 66 instead!"
      : "✅ Highway 5 is clear!";

    // Send the result back to Telex using the return_url provided in the request
    await axios.post(return_url, { message });

    // Optionally, process and send an update via your own Telex webhook as well
    processTrafficData();

    // Respond to Telex that the tick was processed successfully
    res.status(200).send("Done!");
  } catch (error) {
    console.error("Robot error:", error);
    res.status(500).send("Robot broke 😢");
  }
});

// Telex webhook URL (replace with your actual URL)
const telexWebhookUrl =
  "https://ping.telex.im/v1/webhooks/01951929-ca46-7fd8-9ff7-103a5df87ee6";

/**
 * Sends a status update to your Telex channel via the webhook.
 * @param message - The update message (e.g., traffic status)
 * @param status - The update status ("success" or "error")
 */
async function updateTelexTrafficRobot(
  message: string,
  status: string = "success"
): Promise<void> {
  const payload = {
    event_name: "Traffic Robot Update",
    message: message,
    status: status,
    username: "Traffic Robot",
  };

  try {
    const response = await axios.post(telexWebhookUrl, payload);
    console.log("Update sent to Telex:", response.data);
  } catch (error) {
    console.error("Error updating Telex channel:", error);
  }
}

/**
 * Simulated traffic data processing function.
 * After processing, it sends an update to your Telex channel.
 */
async function processTrafficData() {
  // For demonstration, we're setting hasCongestion to true
  const hasCongestion = true; // In real use, determine this based on your data

  const message = hasCongestion
    ? "🚨 Highway 5 is blocked! Use Route 66 instead!"
    : "✅ Highway 5 is clear!";

  // Send the update via the Telex webhook
  await updateTelexTrafficRobot(message, hasCongestion ? "error" : "success");
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
