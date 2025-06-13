import React, { useState, useEffect, useMemo } from 'react';
import { createRevenueCompositionChart, createGrowthRateChart, createCAGRChart, createCAGRPieChart } from '../utils/chartUtils';
import './Analysis.css';

const Analysis = ({ currentStateFilter = 'all', onStateChange, revenueData, charts }) => {
  const [selectedState, setSelectedState] = useState(currentStateFilter);
  const [selectedYear, setSelectedYear] = useState('FY24');
  const [isLoading, setIsLoading] = useState(true);

  // Map filter value to actual state name
  const stateMap = useMemo(() => {
    const map = { all: null };
    if (revenueData) {
      const stateSet = new Set(revenueData.map(item => item.States));
      Array.from(stateSet).forEach(state => {
        const key = state.toLowerCase().replace(/\s+/g, '-');
        map[key] = state;
      });
    }
    return map;
  }, [revenueData]);

  // Available states for dropdown
  const availableStates = useMemo(() => {
    if (!revenueData) return [{ value: 'all', label: 'All States' }];
    const stateSet = new Set(revenueData.map(item => item.States));
    const states = Array.from(stateSet).sort();
    return [
      { value: 'all', label: 'All States' },
      ...states.map(state => ({ value: state.toLowerCase().replace(/\s+/g, '-'), label: state }))
    ];
  }, [revenueData]);

  // Helper: filter data by selected state
  const getFilteredData = (data, stateFilter) => {
    if (!data) return [];
    if (stateFilter === 'all') return data;
    const stateName = stateMap[stateFilter];
    return stateName ? data.filter(item => item.States === stateName) : [];
  };

  // Helper: get display name for state
  const getCurrentStateName = () => {
    if (selectedState === 'all') return 'All States';
    const state = availableStates.find(s => s.value === selectedState);
    return state ? state.label : 'Selected State';
  };

  // Handle dropdowns
  const handleYearChange = (e) => setSelectedYear(e.target.value);
  const handleStateChange = (e) => {
    const newState = e.target.value;
    setSelectedState(newState);
    if (onStateChange) onStateChange(newState);
  };

  // Chart initialization
  useEffect(() => {
    let isMounted = true;
    const initializeCharts = async () => {
      setIsLoading(true);
      const filteredData = getFilteredData(revenueData, selectedState);
      await new Promise(resolve => setTimeout(resolve, 100));
      if (isMounted && filteredData.length > 0) {
        createRevenueCompositionChart(filteredData, charts, selectedYear);
        createGrowthRateChart(filteredData, charts, selectedYear);
        const allStatesData = getFilteredData(revenueData, 'all');
        createCAGRChart(allStatesData, charts);
        createCAGRPieChart(allStatesData, charts);
      }
      setIsLoading(false);
    };
    initializeCharts();
    return () => {
      isMounted = false;
      if (charts.revenueComposition) charts.revenueComposition.destroy();
      if (charts.growthRate) charts.growthRate.destroy();
      if (charts.cagrChart) charts.cagrChart.destroy();
      if (charts.cagrPieChart) charts.cagrPieChart.destroy();
    };
  }, [selectedState, revenueData, charts, selectedYear]);

  // Available years for dropdown
  const availableYears = [
    'FY17', 'FY18', 'FY19', 'FY20', 'FY21', 'FY22', 'FY23', 'FY24', 'FY25-RE', 'FY26-BE'
  ];

  // Data presence check
  const filteredData = getFilteredData(revenueData, selectedState);
  const hasData = filteredData && filteredData.length > 0 && filteredData.some(item => item[selectedYear] && item[selectedYear] !== 0);

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
      ) : !hasData ? (
        <div className="no-data-message">No data available for the selected state and year.</div>
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
            <div className="chart-wrapper" style={{height: '400px', marginTop: '32px'}}>
              <canvas id="cagrPieChart"></canvas>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analysis;
