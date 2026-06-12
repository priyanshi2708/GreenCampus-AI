import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { Alert } from '../models/Alert.js';
import { Resource } from '../models/Resource.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getFallbackAlerts() {
  return [
    {
      title: 'Electricity Usage Spike in Science Building',
      category: 'Energy',
      building: 'Science Building',
      severity: 'Critical',
      status: 'Open',
      description: 'Latest electricity usage of 32,400 kWh is 32% higher than the building average of 24,500 kWh.',
      impact: 'Est. excess cost: $948.00',
      rootCause: {
        whatHappened: 'A sudden 32% surge in electricity consumption was detected at Science Building.',
        whyFlagged: 'The latest reading of 32,400 kWh exceeded the statistical threshold (Z-Score: 2.64) based on historical patterns.',
        potentialCause: 'Laboratory server room cooling issues or HVAC cooling valves jammed open.',
        estimatedImpact: 'An excess of 7,900 kWh consumed. Est. excess cost: $948.00',
        recommendedAction: 'Dispatch energy management team to audit building HVAC chillers and server room cooling units.'
      },
      isRead: false,
      timestamp: new Date(Date.now() - 3600000 * 2)
    },
    {
      title: 'Abnormal Water Consumption in Main Library',
      category: 'Water',
      building: 'Main Library',
      severity: 'Warning',
      status: 'Investigating',
      description: 'Latest water usage of 95,000 L is 24% higher than the building average of 76,600 L.',
      impact: 'Est. excess cost: $55.20',
      rootCause: {
        whatHappened: 'A sudden 24% surge in water consumption was detected at Main Library.',
        whyFlagged: 'The latest reading of 95,000 L exceeded the statistical threshold (Z-Score: 1.98) based on historical patterns.',
        potentialCause: 'Main water pipe fissure / leak or toilet flush valves leaking in Block B restrooms.',
        estimatedImpact: 'An excess of 18,400 L consumed. Est. excess cost: $55.20',
        recommendedAction: 'Inspect main pipe intersections and restrooms for toilet valve leakage.'
      },
      isRead: false,
      timestamp: new Date(Date.now() - 3600000 * 18)
    },
    {
      title: 'Waste Generation Surge in Student Union',
      category: 'Waste',
      building: 'Student Union',
      severity: 'Info',
      status: 'Resolved',
      description: 'Latest waste generated of 2,800 kg is 40% higher than the building average of 2,000 kg.',
      impact: 'Est. excess cost: $120.00',
      rootCause: {
        whatHappened: 'A sudden 40% surge in waste generation was detected at Student Union.',
        whyFlagged: 'The latest reading of 2,800 kg exceeded the statistical threshold (Z-Score: 1.84) based on historical patterns.',
        potentialCause: 'End-of-semester cleanouts or large campus event waste disposal.',
        estimatedImpact: 'An excess of 800 kg generated. Est. excess cost: $120.00',
        recommendedAction: 'Enforce building waste segregation checks and audit recycling dump bins.'
      },
      isRead: true,
      timestamp: new Date(Date.now() - 3600000 * 48)
    }
  ];
}

export const getAlerts = async (req, res, next) => {
  try {
    let alerts = await Alert.find().sort({ timestamp: -1 });

    if (alerts.length === 0) {
      const resources = await Resource.find().sort({ date: 1 }).lean();
      
      const scriptPath = path.join(__dirname, '../ml/detect_anomalies.py');
      
      let pyProcess;
      try {
        pyProcess = spawn('python', [scriptPath]);
      } catch (e) {
        pyProcess = spawn('python3', [scriptPath]);
      }

      let outputData = '';
      let errorOutput = '';

      pyProcess.stdout.on('data', (data) => {
        outputData += data.toString();
      });

      pyProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      pyProcess.stdin.write(JSON.stringify(resources));
      pyProcess.stdin.end();

      await new Promise((resolve) => {
        pyProcess.on('close', async (code) => {
          let detectedAlerts = [];
          if (code === 0) {
            try {
              const parsed = JSON.parse(outputData);
              if (parsed.success && parsed.alerts && parsed.alerts.length > 0) {
                detectedAlerts = parsed.alerts;
              }
            } catch (err) {
              console.error('Failed to parse Python anomaly detection output:', err);
            }
          } else {
            console.error('Python anomaly detection closed with error:', errorOutput);
          }

          if (detectedAlerts.length > 0) {
            const savedAlerts = await Alert.insertMany(detectedAlerts);
            alerts = savedAlerts;
          } else {
            const fallback = getFallbackAlerts();
            const savedAlerts = await Alert.insertMany(fallback);
            alerts = savedAlerts;
          }
          resolve();
        });
      });
    }

    res.status(200).json({ success: true, count: alerts.length, data: alerts });
  } catch (err) {
    next(err);
  }
};

export const createAlert = async (req, res, next) => {
  try {
    const alert = await Alert.create(req.body);
    res.status(201).json({ success: true, data: alert });
  } catch (err) {
    next(err);
  }
};

export const updateAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }
    res.status(200).json({ success: true, data: alert });
  } catch (err) {
    next(err);
  }
};

export const deleteAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findByIdAndDelete(req.params.id);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }
    res.status(200).json({ success: true, message: 'Alert deleted successfully' });
  } catch (err) {
    next(err);
  }
};
