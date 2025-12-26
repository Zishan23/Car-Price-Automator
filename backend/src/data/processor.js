/**
 * Data Processor Module
 * Generated: 2025-12-26
 * 
 * Processes and normalizes car data for ML pipeline
 */

export class DataProcessor {
  /**
   * Normalizes car data for model input
   */
  normalizeData(carData) {
    return carData.map(car => ({
      ...car,
      normalizedMileage: car.mileage / 100000,
      normalizedYear: (car.year - 2000) / 25,
      age: 2024 - car.year
    }));
  }

  /**
   * Removes outliers based on price
   */
  removeOutliers(data, threshold = 3) {
    const prices = data.map(c => c.price);
    const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
    const std = Math.sqrt(
      prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length
    );
    
    return data.filter(car => {
      const zScore = Math.abs((car.price - mean) / std);
      return zScore < threshold;
    });
  }

  /**
   * Splits data into training and test sets
   */
  splitData(data, testRatio = 0.2) {
    const shuffled = [...data].sort(() => Math.random() - 0.5);
    const splitIndex = Math.floor(shuffled.length * (1 - testRatio));
    return {
      training: shuffled.slice(0, splitIndex),
      test: shuffled.slice(splitIndex)
    };
  }
}

export default DataProcessor;
