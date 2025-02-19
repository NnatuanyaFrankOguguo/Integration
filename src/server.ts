import express, {Response, Request} from "express";
import axios from 'axios';
import dotenv from "dotenv";
import cors from "cors";
import staticTrafficData from '../staticTrafficData.json'
dotenv.config();

const app = express();
app.use(cors());
const PORT = process.env.PORT || 5000;
app.use(express.json());

const now = new Date().toISOString().split("T")[0];

// Add this endpoint to your existing server.ts
app.get('/integration.json', (req : Request, res: Response) => {
  const trafficRobotConfig = {
    data: {
      date: {
        "created_at": now,
        "updated_at": now
      },
      descriptions: {
        app_name: 'Traffic Robot 🚦',
        app_description: 'Checks road congestion every 10 minutes!',
        app_logo: 'https://i.imgur.com/lZqvffp.png',
        app_url: 'https://integration-ep7w.onrender.com',
        background_color: '#4A90E2'
      },
      is_active: true,
      integration_type: 'interval',
      key_features : [
        "Real-time traffic congestion updates 🚦",
        "Automatic rerouting suggestions 🗺️",
        "10-minute interval checks ⏱️",
        "Easy integration with Telex channels 📨"
      ],
      integration_category: 'Monitoring & Logging',
      author: 'Frank Oguguo',
      settings: [
        {
          "label": "Site 1",
          "type": "text",
          "required": true,
          "default": "static-data-route-1"
        },
        {
          "label": "Site 2",
          "type": "text",
          "required": true,
          "default": "static-data-route-2"
        },
        {
          label: 'Line interval',
          type: 'text',
          default: '*/10 * * * *', // Every 10 minutes (cron syntax)
          required: true,
          options:[
            "daily",
            "weekly",
            "monthly"
          ]
        },
      ],
      tick_url: 'https://integration-ep7w.onrender.com/tick',
      target_url: '',
      
    }
  };

  res.json(trafficRobotConfig);
});


app.post("/tick", async(req : Request, res: Response) => {
 try {
    const { return_url } = req.body
     // 4. Ask Google Maps about traffic (example for Highway 5)
    const route = staticTrafficData.routes[0];

    const hasCongestion = route.legs[0].steps.some((step: { traffic_speed_entry: string[] }) => 
      step.traffic_speed_entry.includes('congestion')
    );

    let message = hasCongestion ?  '🚨 Highway 5 is blocked! Use Route 66 instead!' : '✅ Highway 5 is clear!';
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
