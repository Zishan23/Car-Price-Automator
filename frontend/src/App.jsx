import React, { useState, useEffect, useRef } from 'react';
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
  const [predictionsHistory, setPredictionsHistory] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [showHistory, setShowHistory] = useState(false);
  const resultRef = useRef(null);

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('carPricePredictions');
    if (saved) {
      try {
        setPredictionsHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading history:', e);
      }
    }
  }, []);

  // Validate form in real-time
  const validateField = (name, value) => {
    const errors = { ...formErrors };
    
    switch (name) {
      case 'make':
        if (!value.trim()) {
          errors.make = 'Make is required';
        } else if (value.length < 2) {
          errors.make = 'Make must be at least 2 characters';
        } else {
          delete errors.make;
        }
        break;
      case 'model':
        if (!value.trim()) {
          errors.model = 'Model is required';
        } else if (value.length < 2) {
          errors.model = 'Model must be at least 2 characters';
        } else {
          delete errors.model;
        }
        break;
      case 'year':
        const yearNum = parseInt(value);
        if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2024) {
          errors.year = 'Year must be between 2000 and 2024';
        } else {
          delete errors.year;
        }
        break;
      case 'mileage':
        const mileageNum = parseInt(value);
        if (isNaN(mileageNum) || mileageNum < 0) {
          errors.mileage = 'Mileage must be a positive number';
        } else if (mileageNum > 500000) {
          errors.mileage = 'Mileage seems unusually high';
        } else {
          delete errors.mileage;
        }
        break;
      default:
        break;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Real-time validation
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const isValid = Object.keys(formData).every(key => {
      if (key === 'condition') return true;
      return validateField(key, formData[key]);
    });
    
    if (!isValid || Object.keys(formErrors).length > 0) {
      return;
    }
    
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
      
      // Save to history if successful
      if (data.success) {
        const historyItem = {
          ...formData,
          prediction: data.prediction,
          timestamp: new Date().toISOString()
        };
        const newHistory = [historyItem, ...predictionsHistory].slice(0, 10); // Keep last 10
        setPredictionsHistory(newHistory);
        localStorage.setItem('carPricePredictions', JSON.stringify(newHistory));
        
        // Scroll to result
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      }
    } catch (error) {
      console.error('Error:', error);
      setPrediction({ success: false, error: 'Failed to get prediction. Please check if the server is running.' });
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setPredictionsHistory([]);
    localStorage.removeItem('carPricePredictions');
  };

  const loadFromHistory = (item) => {
    setFormData({
      make: item.make,
      model: item.model,
      year: item.year,
      mileage: item.mileage,
      condition: item.condition
    });
    setPrediction({ success: true, prediction: item.prediction });
    setShowHistory(false);
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
        <div className="header-actions">
          {predictionsHistory.length > 0 && (
            <button 
              className="history-toggle"
              onClick={() => setShowHistory(!showHistory)}
              title="View prediction history"
            >
              <span>📜</span>
              <span>History ({predictionsHistory.length})</span>
            </button>
          )}
        </div>
        <div className="header-decoration"></div>
      </header>
      
      <main className="App-main">
        {showHistory && predictionsHistory.length > 0 && (
          <div className="card history-card">
            <div className="history-header">
              <h3>📜 Prediction History</h3>
              <button onClick={clearHistory} className="clear-history-btn">Clear</button>
            </div>
            <div className="history-list">
              {predictionsHistory.map((item, index) => (
                <div 
                  key={index} 
                  className="history-item"
                  onClick={() => loadFromHistory(item)}
                >
                  <div className="history-item-main">
                    <div className="history-vehicle">
                      <strong>{item.make} {item.model}</strong>
                      <span className="history-year">{item.year}</span>
                    </div>
                    <div className="history-price">${item.prediction.price.toLocaleString()}</div>
                  </div>
                  <div className="history-item-details">
                    <span>{item.mileage.toLocaleString()} miles</span>
                    <span>•</span>
                    <span>{item.condition}</span>
                    <span>•</span>
                    <span className="history-time">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
                  {formErrors.make && <span className="error-indicator">⚠️</span>}
                </label>
                <input
                  type="text"
                  name="make"
                  value={formData.make}
                  onChange={handleChange}
                  placeholder="e.g., Toyota"
                  className={formErrors.make ? 'error' : ''}
                  required
                />
                {formErrors.make && <span className="error-message">{formErrors.make}</span>}
              </div>
              
              <div className="form-group">
                <label>
                  <span className="label-icon">🚙</span>
                  Model
                  {formErrors.model && <span className="error-indicator">⚠️</span>}
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="e.g., Camry"
                  className={formErrors.model ? 'error' : ''}
                  required
                />
                {formErrors.model && <span className="error-message">{formErrors.model}</span>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>
                  <span className="label-icon">📅</span>
                  Year
                  {formErrors.year && <span className="error-indicator">⚠️</span>}
                </label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  min="2000"
                  max="2024"
                  className={formErrors.year ? 'error' : ''}
                  required
                />
                {formErrors.year && <span className="error-message">{formErrors.year}</span>}
              </div>
              
              <div className="form-group">
                <label>
                  <span className="label-icon">📊</span>
                  Mileage
                  {formErrors.mileage && <span className="error-indicator">⚠️</span>}
                </label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    name="mileage"
                    value={formData.mileage}
                    onChange={handleChange}
                    min="0"
                    className={formErrors.mileage ? 'error' : ''}
                    required
                  />
                  <span className="input-unit">miles</span>
                </div>
                {formErrors.mileage && <span className="error-message">{formErrors.mileage}</span>}
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
          <div 
            ref={resultRef}
            className={`card prediction-result ${prediction.success ? 'success' : 'error'}`}
          >
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
                
                {/* Price Range Indicator */}
                <div className="price-range">
                  <div className="range-bar">
                    <div 
                      className="range-fill" 
                      style={{ width: `${prediction.prediction.confidence * 100}%` }}
                    ></div>
                  </div>
                  <div className="range-labels">
                    <span>Low: ${Math.round(prediction.prediction.price * 0.85).toLocaleString()}</span>
                    <span>High: ${Math.round(prediction.prediction.price * 1.15).toLocaleString()}</span>
                  </div>
                </div>

                <div className="car-details-summary">
                  <div className="detail-item">
                    <span className="detail-icon">🚗</span>
                    <div className="detail-content">
                      <span className="detail-label">Vehicle</span>
                      <span className="detail-value">{formData.make} {formData.model}</span>
                    </div>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">📅</span>
                    <div className="detail-content">
                      <span className="detail-label">Year</span>
                      <span className="detail-value">{formData.year}</span>
                    </div>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">📊</span>
                    <div className="detail-content">
                      <span className="detail-label">Mileage</span>
                      <span className="detail-value">{formData.mileage.toLocaleString()} mi</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setPrediction(null)} 
                  className="new-prediction-button"
                >
                  🔄 New Prediction
                </button>
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

