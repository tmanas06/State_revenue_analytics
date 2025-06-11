import React, { useState, useEffect } from 'react';
import { createRevenueCompositionChart, createGrowthRateChart } from '../utils/chartUtils';
import './Analysis.css';

const Analysis = ({ currentStateFilter = 'all', revenueData, charts }) => {
  const [selectedState, setSelectedState] = useState(currentStateFilter);
  const [selectedYear, setSelectedYear] = useState('FY24');
  const [isLoading, setIsLoading] = useState(true);
  
  // Update selectedState when currentStateFilter prop changes
  useEffect(() => {
    setSelectedState(currentStateFilter);
  }, [currentStateFilter]);
  
  // Available years for selection
  const availableYears = [
    'FY17', 'FY18', 'FY19', 'FY20', 'FY21', 
    'FY22', 'FY23', 'FY24', 'FY25-RE', 'FY26-BE'
  ];
  
  // Generate available states from revenue data
  const availableStates = React.useMemo(() => {
    if (!revenueData) return [{ value: 'all', label: 'All States' }];
    
    // Get unique states from revenue data
    const stateSet = new Set(revenueData.map(item => item.States));
    const states = Array.from(stateSet).sort();
    
    // Convert to the required format
    return [
      { value: 'all', label: 'All States' },
      ...states.map(state => ({
        value: state.toLowerCase().replace(/\s+/g, '-'),
        label: state
      }))
    ];
  }, [revenueData]);

  // Handle year change
  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  };

  // Handle state change
  const handleStateChange = (e) => {
    setSelectedState(e.target.value);
  };

  useEffect(() => {
    setIsLoading(true);
    
    // Filter data based on state filter
    const filteredData = getFilteredData(revenueData, selectedState);
    
    // Create charts with selected year
    createRevenueCompositionChart(filteredData, charts, selectedYear);
    createGrowthRateChart(filteredData, charts, selectedYear);
    
    setIsLoading(false);
    
    // Cleanup function
    return () => {
      if (charts.revenueComposition) {
        charts.revenueComposition.destroy();
      }
      if (charts.growthRate) {
        charts.growthRate.destroy();
      }
    };
  }, [selectedState, revenueData, charts, selectedYear]);
  
  // Map state filter to state name
  const stateMap = React.useMemo(() => {
    const map = { 'all': null };
    if (revenueData) {
      const stateSet = new Set(revenueData.map(item => item.States));
      Array.from(stateSet).forEach(state => {
        const key = state.toLowerCase().replace(/\s+/g, '-');
        map[key] = state;
      });
    }
    return map;
  }, [revenueData]);
  
  // Helper function to filter data by state
  const getFilteredData = (data, stateFilter) => {
    if (!data) return [];
    if (stateFilter === 'all') return data;
    
    const stateName = stateMap[stateFilter];
    return stateName ? data.filter(item => item.States === stateName) : [];
  };

  // Get current state name for display
  const getCurrentStateName = () => {
    if (selectedState === 'all') return 'All States';
    const state = availableStates.find(s => s.value === selectedState);
    return state ? state.label : 'Selected State';
  };

  return (
    <div className="analysis-page">
      <div className="analysis-header">
        <h1>Revenue Analysis Dashboard</h1>
        <div className="analysis-controls">
          <div className="form-group">
            <label htmlFor="stateSelect">Select State:</label>
            <select 
              className="form-select state-select"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
            >
              {availableStates.map(state => (
                <option key={state.value} value={state.value}>
                  {state.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="yearSelect">Select Year:</label>
            <select 
              id="yearSelect" 
              value={selectedYear} 
              onChange={handleYearChange}
              className="form-control"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="loading">Loading charts...</div>
      ) : (
        <div className="chart-container">
          <div className="chart-full">
            <div className="chart-header">
              <h2>Revenue Composition - {getCurrentStateName()} ({selectedYear})</h2>
              <div className="chart-legend">
                <span className="legend-item">
                  <span className="legend-color" style={{backgroundColor: '#4e73df'}}></span>
                  Revenue by Category
                </span>
              </div>
            </div>
            <div className="chart-wrapper">
              <canvas id="revenueCompositionChart"></canvas>
            </div>
          </div>
          
          <div className="chart-full">
            <div className="chart-header">
              <h2>Growth Rate Analysis - {getCurrentStateName()} ({selectedYear} vs {selectedYear.replace(/(\d+)/, (match, p1) => parseInt(p1) - 1)} )</h2>
              <div className="chart-legend">
                <span className="legend-item">
                  <span className="legend-color" style={{backgroundColor: '#1cc88a'}}></span>
                  Positive Growth
                </span>
                <span className="legend-item">
                  <span className="legend-color" style={{backgroundColor: '#e74a3b'}}></span>
                  Negative Growth
                </span>
              </div>
            </div>
            <div className="chart-wrapper">
              <canvas id="growthRateChart"></canvas>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analysis;
