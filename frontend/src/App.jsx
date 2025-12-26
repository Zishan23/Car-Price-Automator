import React, { useState } from 'react';
import './App.css';

function App() {
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: 2020,
    mileage: 50000,
    condition: 'good'
  });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // STUB: Replace with actual API call
      const response = await fetch('http://localhost:3000/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      setPrediction(data);
    } catch (error) {
      console.error('Error:', error);
      setPrediction({ success: false, error: 'Failed to get prediction' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚗 Car Price Automator</h1>
        <p>Predict car prices using AI</p>
      </header>
      
      <main className="App-main">
        <form onSubmit={handleSubmit} className="prediction-form">
          <div className="form-group">
            <label>Make:</label>
            <input
              type="text"
              name="make"
              value={formData.make}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Model:</label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Year:</label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              min="2000"
              max="2024"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Mileage:</label>
            <input
              type="number"
              name="mileage"
              value={formData.mileage}
              onChange={handleChange}
              min="0"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Condition:</label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
            >
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>
          
          <button type="submit" disabled={loading}>
            {loading ? 'Predicting...' : 'Predict Price'}
          </button>
        </form>
        
        {prediction && (
          <div className="prediction-result">
            {prediction.success ? (
              <div>
                <h2>Predicted Price</h2>
                <p className="price">${prediction.prediction.price.toLocaleString()}</p>
                <p className="confidence">Confidence: {(prediction.prediction.confidence * 100).toFixed(0)}%</p>
              </div>
            ) : (
              <div className="error">
                <p>Error: {prediction.error}</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

