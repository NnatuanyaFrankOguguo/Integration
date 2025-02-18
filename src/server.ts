import express from "express";
import axios from 'axios';
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());

interface GoogleMapsResponse {
  routes: {
    legs: {
      steps: {
        traffic_speed_entry: string[];
      }[];
    }[];
  }[];
}

// 3. Get Google Maps API key from environment
const GOOGLE_MAPS_KEY = process.env.GOOGLE_MAPS_API_KEY;
if (!GOOGLE_MAPS_KEY) {
  throw new Error('❌ Google Maps API key missing! Add it to .env file.');
}

// Add this endpoint to your existing server.ts
app.get('/traffic-robot.json', (req, res) => {
  const trafficRobotConfig = {
    data: {
      descriptions: {
        app_name: 'Traffic Robot 🚦',
        app_description: 'Checks road congestion every 10 minutes!',
        app_logo: 'https://example.com/robot-logo.png',
        app_url: 'https://integration-ep7w.onrender.com',
        background_color: '#4A90E2'
      },
      integration_type: 'interval',
      integration_category: 'Monitoring & Logging',
      key_features : [
        "Real-time traffic congestion updates 🚦",
        "Automatic rerouting suggestions 🗺️",
        "10-minute interval checks ⏱️",
        "Easy integration with Telex channels 📨"
      ],
      settings: [
        {
          label: 'interval',
          type: 'text',
          default: '*/10 * * * *', // Every 10 minutes (cron syntax)
          required: true
        }
      ],
      tick_url: 'https://integration-ep7w.onrender.com/tick',
      output: [
          {
            "label": "default",
            "value": true
          }
        ],
        permissions: {
          "read_messages": true,
          "send_messages": true
        }
      }
  };

  res.json(trafficRobotConfig);
});


app.post("/tick", async(req, res) => {
 try {
    const { return_url } = req.body
     // 4. Ask Google Maps about traffic (example for Highway 5)
    const response = await axios.get<GoogleMapsResponse>(
      `https://maps.googleapis.com/maps/api/directions/json?origin=Start&destination=End&key=${GOOGLE_MAPS_KEY}&departure_time=now&traffic_model=best_guess`
    );
    const route = response.data.routes[0];
    const hasCongestion = route.legs[0].steps.some(step => step.traffic_speed_entry.includes('congestion'));

    let message = '';
    if (hasCongestion) {
      message = '🚨 Highway 5 is blocked! Use Route 66 instead!';
    } else {
      message = '✅ Highway 5 is clear!';
    }
    // 7. Send the message back to Telex's channel
    await axios.post(return_url, { message });

    // 8. Tell Telex everything worked
    res.status(200).send('Done!');


  } catch(error) {
    console.error('Robot error:', error);
    res.status(500).send('Robot broke 😢');
  }

});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
