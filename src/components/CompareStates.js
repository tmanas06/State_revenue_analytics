import React, { useEffect, useRef, useState, useMemo } from 'react';
import { createStateComparisonChart, formatCurrency } from '../utils/chartUtils';

const CompareStates = ({ revenueData, charts = {} }) => {
  const chartInstance = useRef(null);
  const [selectedStates, setSelectedStates] = useState(['Odisha', 'Uttar Pradesh']);
  const [selectedTypes, setSelectedTypes] = useState(['Commercial Taxes', 'Excise', 'Electricity']);
  const [year, setYear] = useState('FY24');

  // Get unique states and types from revenue data
  const { states, types, years } = useMemo(() => {
    const stateSet = new Set();
    const typeSet = new Set();
    const yearColumns = ['FY17', 'FY18', 'FY19', 'FY20', 'FY21', 'FY22', 'FY23', 'FY24', 'FY25-RE', 'FY26-BE'];
    
    revenueData?.forEach(item => {
      stateSet.add(item.States);
      typeSet.add(item.Type);
    });
    
    return {
      states: Array.from(stateSet),
      types: Array.from(typeSet),
      years: yearColumns
    };
  }, [revenueData]);

  // Filter and prepare data for the chart
  const filteredData = useMemo(() => {
    if (!revenueData) return [];
    
    return revenueData.filter(item => 
      selectedStates.includes(item.States) && 
      selectedTypes.includes(item.Type)
    );
  }, [revenueData, selectedStates, selectedTypes]);

  // Calculate metrics for selected states
  const stateMetrics = useMemo(() => {
    const metrics = {};
    
    selectedStates.forEach(state => {
      const stateData = revenueData?.filter(item => item.States === state) || [];
      const totalRevenue = stateData.reduce((sum, item) => sum + (item[year] || 0), 0);
      
      // Find top category
      const categoryRevenues = {};
      stateData.forEach(item => {
        categoryRevenues[item.Type] = (categoryRevenues[item.Type] || 0) + (item[year] || 0);
      });
      
      const topCategory = Object.entries(categoryRevenues)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
      
      // Calculate YoY growth if possible
      const prevYear = years[years.indexOf(year) - 1];
      let yoyGrowth = null;
      
      if (prevYear) {
        const currentRevenue = stateData.reduce((sum, item) => sum + (item[year] || 0), 0);
        const prevRevenue = stateData.reduce((sum, item) => sum + (item[prevYear] || 0), 0);
        yoyGrowth = prevRevenue ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0;
      }
      
      metrics[state] = {
        totalRevenue,
        topCategory,
        yoyGrowth
      };
    });
    
    return metrics;
  }, [revenueData, selectedStates, year, years]);

  // Update chart when filters or data changes
  useEffect(() => {
    if (!filteredData || filteredData.length === 0) return;
    
    try {
      // Create chart with selected states and types
      createStateComparisonChart(
        filteredData, 
        selectedStates, 
        [year], 
        charts
      );
    } catch (error) {
      console.error('Error creating comparison charts:', error);
    }
    
    // No need to clean up individual charts as they're managed by the container
  }, [filteredData, selectedStates, selectedTypes, year, charts]);

  const toggleState = (state) => {
    setSelectedStates(prev => 
      prev.includes(state)
        ? prev.filter(s => s !== state)
        : [...prev, state]
    );
  };
  
  const removeState = (state, e) => {
    e.stopPropagation();
    setSelectedStates(prev => prev.filter(s => s !== state));
  };

  const handleTypeChange = (e) => {
    const options = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedTypes(options);
  };

  const handleYearChange = (e) => {
    setYear(e.target.value);
  };

  return (
    <div className="compare-states">
      <div className="filters-container">
        <div className="filter-group">
          <label>Select States:</label>
          <div className="states-dropdown">
            <div className="selected-states">
              {selectedStates.length > 0 ? (
                selectedStates.map(state => (
                  <span key={state} className="state-tag">
                    {state}
                    <button 
                      type="button" 
                      className="remove-state"
                      onClick={(e) => removeState(state, e)}
                    >
                      ×
                    </button>
                  </span>
                ))
              ) : (
                <span className="placeholder">Click to select states</span>
              )}
              <input 
                type="text" 
                className="state-search" 
                placeholder="Search states..."
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="states-list">
              {states.map(state => (
                <label key={state} className="state-option">
                  <input
                    type="checkbox"
                    checked={selectedStates.includes(state)}
                    onChange={() => toggleState(state)}
                  />
                  <span className="checkmark"></span>
                  {state}
                </label>
              ))}
            </div>
          </div>
        </div>
        
        <div className="filter-group">
          <label htmlFor="type-select">Select Revenue Types:</label>
          <select 
            id="type-select"
            multiple
            value={selectedTypes}
            onChange={handleTypeChange}
            className="filter-select"
          >
            {types.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="year-select">Select Year:</label>
          <select 
            id="year-select"
            value={year}
            onChange={handleYearChange}
            className="filter-select"
          >
            {years.map(y => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="chart-container">
        <div className="chart-card full-width">
          <h3>Revenue Comparison by Category ({year})</h3>
          <div className="chart-container">
            <div id="stateComparisonContainer" className="state-charts-container"></div>
          </div>
        </div>
      </div>
      
      <div className="metrics-grid">
        {selectedStates.map(state => (
          <div key={state} className="metrics-card">
            <h3>{state}</h3>
            <div className="metric">
              <span className="metric-label">Total Revenue ({year}):</span>
              <span className="metric-value">
                {formatCurrency(stateMetrics[state]?.totalRevenue || 0)}
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Top Category:</span>
              <span className="metric-value">
                {stateMetrics[state]?.topCategory || 'N/A'}
              </span>
            </div>
            {stateMetrics[state]?.yoyGrowth !== null && (
              <div className="metric">
                <span className="metric-label">YoY Growth:</span>
                <span className={`metric-value ${stateMetrics[state].yoyGrowth >= 0 ? 'positive' : 'negative'}`}>
                  {stateMetrics[state].yoyGrowth >= 0 ? '↑ ' : '↓ '}
                  {Math.abs(stateMetrics[state].yoyGrowth).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompareStates;
