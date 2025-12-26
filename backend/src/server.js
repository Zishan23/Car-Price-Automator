/**
 * Express Server for Car Price Automator API
 * Main entry point for the backend application
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Price prediction endpoint
app.post('/api/predict', async (req, res) => {
  try {
    const { make, model, year, mileage, condition } = req.body;
    
    // STUB: Replace with actual ML model prediction
    const basePrice = 25000;
    const depreciation = (2024 - year) * 2000;
    const mileageDepreciation = mileage * 0.15;
    const predictedPrice = Math.max(5000, basePrice - depreciation - mileageDepreciation);
    
    res.json({
      success: true,
      prediction: {
        price: Math.round(predictedPrice),
        confidence: 0.85,
        factors: {
          make,
          model,
          year,
          mileage,
          condition: condition || 'good'
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;

