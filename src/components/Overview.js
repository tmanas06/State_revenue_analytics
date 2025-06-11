import React, { useState, useEffect } from 'react';
import { createRevenueTrendsChart, createRevenueCompositionChart, createStateComparisonChart, createGrowthRateChart } from '../utils/chartUtils';

// Helper function to filter data based on state selection
const getFilteredData = (data, stateFilter) => {
  if (stateFilter === 'both') {
    return data;
  }
  return data.filter(item => item.States === stateFilter);
};

const Overview = ({ currentStateFilter, setCurrentStateFilter, currentYearRange, setCurrentYearRange, revenueData, charts }) => {
  const [filteredData, setFilteredData] = useState([]);
  const [years, setYears] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [topCategory, setTopCategory] = useState('');
  const [growthRate, setGrowthRate] = useState(0);

  // Get unique states from revenue data
  const states = React.useMemo(() => {
    if (!revenueData) return [];
    const stateSet = new Set(revenueData.map(item => item.States));
    return Array.from(stateSet).sort();
  }, [revenueData]);

  // Filter data based on state filter
  useEffect(() => {
    if (!revenueData) return;
    
    const filtered = getFilteredData(revenueData, currentStateFilter);
    setFilteredData(filtered);
    
    // Calculate years based on range
    const yearColumns = ['FY17', 'FY18', 'FY19', 'FY20', 'FY21', 'FY22', 'FY23', 'FY24', 'FY25-RE', 'FY26-BE'];
    const yearRange = yearColumns.slice(currentYearRange[0], currentYearRange[1] + 1);
    setYears(yearRange);
    
    // Calculate total revenue
    const total = filtered.reduce((sum, item) => sum + (item['FY24'] || 0), 0);
    setTotalRevenue(total);
    
    // Calculate top category
    const categories = {};
    filtered.forEach(item => {
      categories[item.Type] = (categories[item.Type] || 0) + (item['FY24'] || 0);
    });
    const top = Object.entries(categories).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    setTopCategory(top);
    
    // Calculate growth rate
    let currentYearTotal = 0;
    let prevYearTotal = 0;
    
    filtered.forEach(item => {
      currentYearTotal += item['FY24'] || 0;
      prevYearTotal += item['FY23'] || 0;
    });
    
    const rate = prevYearTotal ? ((currentYearTotal - prevYearTotal) / prevYearTotal * 100) : 0;
    setGrowthRate(rate);
    
  }, [revenueData, currentStateFilter, currentYearRange]);
  
  // Create charts when data changes
  useEffect(() => {
    if (filteredData.length > 0 && years.length > 0) {
      createRevenueTrendsChart(filteredData, years, charts);
      createRevenueCompositionChart(filteredData, charts);
      createStateComparisonChart(revenueData, currentStateFilter, years, charts);
      createGrowthRateChart(filteredData, charts);
    }
  }, [filteredData, years, currentStateFilter, charts, revenueData]);
  
  // Helper function to filter data by state
  const getFilteredData = (data, stateFilter) => {
    if (!data) return [];
    
    if (stateFilter === 'both') {
      return [...data];
    }
    
    // Convert state filter to match the format in the data
    const stateName = stateFilter
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
      
    return data.filter(item => item.States === stateName);
  };
  
  // Convert state name to URL-friendly format
  const toUrlFriendly = (state) => {
    return state.toLowerCase().replace(/\s+/g, '-');
  };
  
  // Format currency
  const formatCurrency = (value) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L Cr`;
    }
    return `₹${value.toLocaleString('en-IN')} Cr`;
  };

  return (
    <div className="overview">
      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          <label>State</label>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button 
              key="both"
              className={`btn ${currentStateFilter === 'both' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setCurrentStateFilter('both')}
            >
              All States
            </button>
            {states.map(state => {
              const stateId = toUrlFriendly(state);
              return (
                <button
                  key={stateId}
                  className={`btn ${currentStateFilter === stateId ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setCurrentStateFilter(stateId)}
                >
                  {state}
                </button>
              );
            })}
          </div>  
        </div>

        <div className="filter-group">
          <label>Year Range</label>
          <div className="range-slider">
            <span>FY17</span>
            <input 
              type="range" 
              min="0" 
              max="9" 
              value={currentYearRange[0]}
              onChange={(e) => setCurrentYearRange([parseInt(e.target.value), currentYearRange[1]])}
            />
            <span>to</span>
            <input 
              type="range" 
              min="0" 
              max="9" 
              value={currentYearRange[1]}
              onChange={(e) => setCurrentYearRange([currentYearRange[0], parseInt(e.target.value)])}
            />
            <span>FY26-BE</span>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="overview-cards">
        <div className="card">
          <h3>Total Revenue</h3>
          <div className="card-value">{formatCurrency(totalRevenue)}</div>
          <div className={`card-trend ${growthRate >= 0 ? 'positive' : 'negative'}`}>
            {growthRate >= 0 ? '↑' : '↓'} {Math.abs(growthRate).toFixed(1)}% vs last year
          </div>
        </div>
        <div className="card">
          <h3>Top Category</h3>
          <div className="card-value">{topCategory}</div>
          <div className="card-trend positive">↑ 8.2% growth</div>
        </div>
        <div className="card">
          <h3>States</h3>
          <div className="card-value">
            {currentStateFilter === 'both' ? '2' : '1'}
          </div>
          <div className="card-trend neutral">Active</div>
        </div>
      </div>

      {/* Charts */}
      <div className="chart-container">
        <div className="chart-card">
          <h3>Revenue Trends</h3>
          <div className="chart-wrapper">
            <canvas id="revenueTrendsChart"></canvas>
          </div>
        </div>
        <div className="chart-card">
          <h3>Revenue by Category</h3>
          <div className="chart-wrapper">
            <canvas id="revenueCompositionChart"></canvas>
          </div>
        </div>
        <div className="chart-card">
          <h3>State Comparison</h3>
          <div className="chart-wrapper">
            <canvas id="stateComparisonChart"></canvas>
          </div>
        </div>
        <div className="chart-card">
          <h3>Growth Rate</h3>
          <div className="chart-wrapper">
            <canvas id="growthRateChart"></canvas>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
