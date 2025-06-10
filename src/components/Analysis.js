import React, { useEffect } from 'react';
import { createRevenueCompositionChart, createGrowthRateChart } from '../utils/chartUtils';

const Analysis = ({ currentStateFilter, revenueData, charts }) => {
  useEffect(() => {
    // Filter data based on state filter
    const filteredData = getFilteredData(revenueData, currentStateFilter);
    
    // Create charts
    createRevenueCompositionChart(filteredData, charts);
    createGrowthRateChart(filteredData, charts);
    
    // Cleanup function
    return () => {
      if (charts.revenueComposition) {
        charts.revenueComposition.destroy();
      }
      if (charts.growthRate) {
        charts.growthRate.destroy();
      }
    };
  }, [currentStateFilter, revenueData, charts]);
  
  // Helper function to filter data by state
  const getFilteredData = (data, stateFilter) => {
    let filtered = [...data];
    
    if (stateFilter === 'odisha') {
      filtered = filtered.filter(item => item.States === 'Odisha');
    } else if (stateFilter === 'uttar-pradesh') {
      filtered = filtered.filter(item => item.States === 'Uttar Pradesh');
    }
    
    return filtered;
  };

  return (
    <div className="analysis">
      <h2>Revenue Analysis</h2>
      <div className="chart-container">
        <div className="chart-card">
          <h3>Revenue Composition</h3>
          <div className="chart-wrapper">
            <canvas id="revenueCompositionChart"></canvas>
          </div>
        </div>
        <div className="chart-card">
          <h3>Growth Rate Analysis</h3>
          <div className="chart-wrapper">
            <canvas id="growthRateChart"></canvas>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
