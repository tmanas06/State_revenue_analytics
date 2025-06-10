import React, { useEffect } from 'react';
import { createRevenueTrendsChart } from '../utils/chartUtils';

const RevenueTrends = ({ currentStateFilter, currentYearRange, revenueData, charts }) => {
  useEffect(() => {
    // Filter data based on state filter
    const filteredData = getFilteredData(revenueData, currentStateFilter);
    
    // Get years based on range
    const yearColumns = ['FY17', 'FY18', 'FY19', 'FY20', 'FY21', 'FY22', 'FY23', 'FY24', 'FY25-RE', 'FY26-BE'];
    const years = yearColumns.slice(currentYearRange[0], currentYearRange[1] + 1);
    
    // Create chart
    createRevenueTrendsChart(filteredData, years, charts);
    
    // Cleanup function
    return () => {
      if (charts.revenueTrends) {
        charts.revenueTrends.destroy();
      }
    };
  }, [currentStateFilter, currentYearRange, revenueData, charts]);
  
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
    <div className="revenue-trends">
      <h2>Revenue Trends</h2>
      <div className="chart-container">
        <div className="chart-card full-width">
          <div className="chart-wrapper">
            <canvas id="revenueTrendsChart"></canvas>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueTrends;
