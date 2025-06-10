import React, { useEffect, useRef } from 'react';
import { createStateComparisonChart } from '../utils/chartUtils';

const CompareStates = ({ currentStateFilter, revenueData, charts = {} }) => {
  const chartInstance = useRef(null);
  useEffect(() => {
    if (!revenueData || revenueData.length === 0) return;
    
    try {
      // Always show both states for comparison
      const yearColumns = ['FY17', 'FY18', 'FY19', 'FY20', 'FY21', 'FY22', 'FY23', 'FY24', 'FY25-RE', 'FY26-BE'];
      const years = yearColumns.slice(0, 9); // Default to all years
      
      // Create chart with both states
      const chart = createStateComparisonChart(revenueData, 'both', years, charts);
      if (chart) {
        chartInstance.current = chart;
      }
    } catch (error) {
      console.error('Error creating comparison chart:', error);
    }
    
    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [revenueData, charts]);

  return (
    <div className="compare-states">
      <h2>State Comparison</h2>
      <div className="chart-container">
        <div className="chart-card full-width">
          <h3>Revenue Comparison by Category</h3>
          <div className="chart-wrapper">
            <canvas id="stateComparisonChart"></canvas>
          </div>
        </div>
      </div>
      
      <div className="metrics-grid">
        <div className="metrics-card">
          <h3>Odisha</h3>
          <div className="metric">
            <span className="metric-label">Total Revenue (FY24):</span>
            <span className="metric-value">₹80,618 Cr</span>
          </div>
          <div className="metric">
            <span className="metric-label">Top Category:</span>
            <span className="metric-value">Commercial Taxes</span>
          </div>
          <div className="metric">
            <span className="metric-label">YoY Growth:</span>
            <span className="metric-value positive">↑ 12.5%</span>
          </div>
        </div>
        
        <div className="metrics-card">
          <h3>Uttar Pradesh</h3>
          <div className="metric">
            <span className="metric-label">Total Revenue (FY24):</span>
            <span className="metric-value">₹1,12,307 Cr</span>
          </div>
          <div className="metric">
            <span className="metric-label">Top Category:</span>
            <span className="metric-value">Commercial Taxes</span>
          </div>
          <div className="metric">
            <span className="metric-label">YoY Growth:</span>
            <span className="metric-value positive">↑ 15.2%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareStates;
