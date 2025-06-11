import React, { useState, useEffect } from 'react';
import { createRevenueCompositionChart, createGrowthRateChart, createCAGRChart } from '../utils/chartUtils';
import './Analysis.css';

const Analysis = ({ currentStateFilter = 'all', onStateChange, revenueData, charts }) => {
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
    const newState = e.target.value;
    setSelectedState(newState);
    if (onStateChange) {
      onStateChange(newState);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const initializeCharts = async () => {
      try {
        setIsLoading(true);
        
        // Filter data based on state filter
        const filteredData = getFilteredData(revenueData, selectedState);
        
        // Wait for DOM to be ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Create charts with selected year
        if (isMounted) {
          createRevenueCompositionChart(filteredData, charts, selectedYear);
          createGrowthRateChart(filteredData, charts, selectedYear);
          
          // Always show all states for CAGR chart
          const allStatesData = getFilteredData(revenueData, 'all');
          createCAGRChart(allStatesData, charts);
          
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error initializing charts:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    initializeCharts();
    
    // Cleanup function
    return () => {
      isMounted = false;
      if (charts.revenueComposition) {
        charts.revenueComposition.destroy();
      }
      if (charts.growthRate) {
        charts.growthRate.destroy();
      }
      if (charts.cagrChart) {
        charts.cagrChart.destroy();
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
              onChange={handleStateChange}
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
          
          <div className="chart-full">
            <div className="chart-header">
              <h2>Compound Annual Growth Rate (CAGR) by State</h2>
              <div className="chart-legend">
                <span className="legend-item">
                  <span className="legend-color" style={{backgroundColor: 'rgba(28, 200, 138, 0.8)'}}></span>
                  Positive Growth
                </span>
                <span className="legend-item">
                  <span className="legend-color" style={{backgroundColor: 'rgba(231, 74, 59, 0.8)'}}></span>
                  Negative Growth
                </span>
              </div>
            </div>
            <div className="chart-wrapper" style={{height: '500px'}}>
              <canvas id="cagrChart"></canvas>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analysis;
