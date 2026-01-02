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
    setPrediction(null);
    
    try {
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
      setPrediction({ success: false, error: 'Failed to get prediction. Please check if the server is running.' });
    } finally {
      setLoading(false);
    }
  };

  const conditionEmojis = {
    excellent: '✨',
    good: '👍',
    fair: '⚠️',
    poor: '🔧'
  };

  return (
    <div className="App">
      <div className="background-pattern"></div>
      <header className="App-header">
        <div className="logo-container">
          <div className="logo-icon">🚗</div>
          <h1>Car Price Automator</h1>
        </div>
        <p className="subtitle">AI-Powered Price Prediction</p>
        <div className="header-decoration"></div>
      </header>
      
      <main className="App-main">
        <div className="card prediction-form-card">
          <div className="card-header">
            <h2>Enter Car Details</h2>
            <p>Fill in the information below to get an accurate price prediction</p>
          </div>
          
          <form onSubmit={handleSubmit} className="prediction-form">
            <div className="form-row">
              <div className="form-group">
                <label>
                  <span className="label-icon">🏭</span>
                  Make
                </label>
                <input
                  type="text"
                  name="make"
                  value={formData.make}
                  onChange={handleChange}
                  placeholder="e.g., Toyota"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>
                  <span className="label-icon">🚙</span>
                  Model
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="e.g., Camry"
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>
                  <span className="label-icon">📅</span>
                  Year
                </label>
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
                <label>
                  <span className="label-icon">📊</span>
                  Mileage
                </label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    name="mileage"
                    value={formData.mileage}
                    onChange={handleChange}
                    min="0"
                    required
                  />
                  <span className="input-unit">miles</span>
                </div>
              </div>
            </div>
            
            <div className="form-group full-width">
              <label>
                <span className="label-icon">⭐</span>
                Condition
              </label>
              <div className="condition-selector">
                {['excellent', 'good', 'fair', 'poor'].map((cond) => (
                  <label key={cond} className={`condition-option ${formData.condition === cond ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="condition"
                      value={cond}
                      checked={formData.condition === cond}
                      onChange={handleChange}
                    />
                    <span className="condition-emoji">{conditionEmojis[cond]}</span>
                    <span className="condition-label">{cond.charAt(0).toUpperCase() + cond.slice(1)}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <button type="submit" disabled={loading} className="submit-button">
              {loading ? (
                <>
                  <span className="spinner"></span>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <span>💰</span>
                  <span>Predict Price</span>
                </>
              )}
            </button>
          </form>
        </div>
        
        {prediction && (
          <div className={`card prediction-result ${prediction.success ? 'success' : 'error'}`}>
            {prediction.success ? (
              <div className="result-content">
                <div className="result-icon">✅</div>
                <h2>Estimated Price</h2>
                <div className="price-container">
                  <span className="currency">$</span>
                  <span className="price">{prediction.prediction.price.toLocaleString()}</span>
                </div>
                <div className="confidence-badge">
                  <span className="confidence-icon">📈</span>
                  <span>Confidence: {(prediction.prediction.confidence * 100).toFixed(0)}%</span>
                </div>
                <div className="car-details-summary">
                  <div className="detail-item">
                    <span className="detail-label">Vehicle:</span>
                    <span className="detail-value">{formData.make} {formData.model}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Year:</span>
                    <span className="detail-value">{formData.year}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Mileage:</span>
                    <span className="detail-value">{formData.mileage.toLocaleString()} miles</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="error-content">
                <div className="error-icon">⚠️</div>
                <h2>Error</h2>
                <p>{prediction.error}</p>
                <button onClick={() => setPrediction(null)} className="retry-button">
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}
      </main>
      
      <footer className="App-footer">
        <p>Powered by AI • Accurate Price Predictions</p>
      </footer>
    </div>
  );
}

export default App;

