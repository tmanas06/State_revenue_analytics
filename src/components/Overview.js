import React, { useState, useEffect, useMemo } from 'react';
import {
  createRevenueTrendsChart,
  createRevenueCompositionChart,
  createStateComparisonChart,
  createGrowthRateChart
} from '../utils/chartUtils';

const yearColumns = ['FY17', 'FY18', 'FY19', 'FY20', 'FY21', 'FY22', 'FY23', 'FY24', 'FY25-RE', 'FY26-BE'];

const getStateName = (filter, revenueData) => {
  if (filter === 'both') return 'both';
  const stateSet = new Set(revenueData.map(item => item.States));
  const mapping = {};
  Array.from(stateSet).forEach(state => {
    mapping[state.toLowerCase().replace(/\s+/g, '-')] = state;
  });
  return mapping[filter] || filter;
};

const getFilteredData = (data, stateFilter) => {
  if (!data) return [];
  if (stateFilter === 'both') return [...data];
  const stateName = getStateName(stateFilter, data);
  return data.filter(item => item.States === stateName);
};

const toUrlFriendly = (state) => state.toLowerCase().replace(/\s+/g, '-');

const formatCurrency = (value) => {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L Cr`;
  return `₹${value.toLocaleString('en-IN')} Cr`;
};

const Overview = ({
  currentStateFilter,
  setCurrentStateFilter,
  currentYearRange,
  setCurrentYearRange,
  revenueData,
  charts
}) => {
  const [filteredData, setFilteredData] = useState([]);
  const [years, setYears] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [topCategory, setTopCategory] = useState('');
  const [growthRate, setGrowthRate] = useState(0);

  const states = useMemo(() => {
    if (!revenueData) return [];
    const stateSet = new Set(revenueData.map(item => item.States));
    return Array.from(stateSet).sort();
  }, [revenueData]);

  useEffect(() => {
    if (!revenueData) return;

    const filtered = getFilteredData(revenueData, currentStateFilter);
    setFilteredData(filtered);

    const yearRange = yearColumns.slice(currentYearRange[0], currentYearRange[1] + 1);
    setYears(yearRange);

    const currentYear = 'FY24';
    const prevYear = 'FY23';

    let currentYearTotal = 0;
    let prevYearTotal = 0;

    const stateMetrics = {};
    states.forEach(state => {
      stateMetrics[state] = {
        currentYearTotal: 0,
        prevYearTotal: 0,
        categories: {}
      };
    });

    revenueData.forEach(item => {
      const state = item.States;
      if (stateMetrics[state]) {
        stateMetrics[state].currentYearTotal += item[currentYear] || 0;
        stateMetrics[state].prevYearTotal += item[prevYear] || 0;
        stateMetrics[state].categories[item.Type] =
          (stateMetrics[state].categories[item.Type] || 0) + (item[currentYear] || 0);
      }
    });

    if (currentStateFilter === 'both') {
      const allStatesData = Object.values(stateMetrics);
      currentYearTotal = allStatesData.reduce((sum, state) => sum + state.currentYearTotal, 0);
      prevYearTotal = allStatesData.reduce((sum, state) => sum + state.prevYearTotal, 0);

      const allCategories = {};
      allStatesData.forEach(state => {
        Object.entries(state.categories).forEach(([category, value]) => {
          allCategories[category] = (allCategories[category] || 0) + value;
        });
      });
      const top = Object.entries(allCategories).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
      setTopCategory(top);
    } else {
      const stateName = getStateName(currentStateFilter, revenueData);
      const stateData = stateMetrics[stateName] || {};
      currentYearTotal = stateData.currentYearTotal || 0;
      prevYearTotal = stateData.prevYearTotal || 0;

      const top = Object.entries(stateData.categories || {})
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
      setTopCategory(top);
    }

    const growth = prevYearTotal > 0
      ? ((currentYearTotal - prevYearTotal) / prevYearTotal) * 100
      : 0;

    setTotalRevenue(currentYearTotal);
    setGrowthRate(growth);
  }, [revenueData, currentStateFilter, currentYearRange]);

  useEffect(() => {
    if (filteredData.length > 0 && years.length > 0) {
      createRevenueTrendsChart(filteredData, years, charts);
      createRevenueCompositionChart(filteredData, charts);
      createStateComparisonChart(revenueData, currentStateFilter, years, charts);
      createGrowthRateChart(filteredData, charts);
    }
  }, [filteredData, years, currentStateFilter, charts, revenueData]);

  return (
    <div className="overview">
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
            <span>{yearColumns[0]}</span>
            <input
              type="range"
              min="0"
              max={yearColumns.length - 1}
              value={currentYearRange[0]}
              onChange={(e) => setCurrentYearRange([parseInt(e.target.value), currentYearRange[1]])}
            />
            <span>to</span>
            <input
              type="range"
              min="0"
              max={yearColumns.length - 1}
              value={currentYearRange[1]}
              onChange={(e) => setCurrentYearRange([currentYearRange[0], parseInt(e.target.value)])}
            />
            <span>{yearColumns[yearColumns.length - 1]}</span>
          </div>
        </div>
      </div>

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
          <div className="card-trend">
            {topCategory ? `${topCategory.length > 12 ? topCategory.substring(0, 10) + '...' : topCategory}` : 'N/A'}
          </div>
        </div>
        <div className="card">
          <h3>States</h3>
          <div className="card-value">{currentStateFilter === 'both' ? states.length : '1'}</div>
          <div className="card-trend neutral">
            {currentStateFilter === 'both'
              ? 'All States'
              : getStateName(currentStateFilter, revenueData)}
          </div>
        </div>
      </div>

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
