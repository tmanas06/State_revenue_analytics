import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Chart } from 'chart.js/auto';
import {
  revenueData,
  fiscalYears,
  getTotalRevenueByStateAndYear,
  getRevenueTrend,
  getCAGR,
  getTotalRevenueByState,
  getTotalRevenueByType,
  getTopRevenueTypesByState
} from '../data/revenueData';
import './analysis.css';

const stateOptions = Array.from(new Set(revenueData.map(d => d.abbreviation)))
  .map(abbr => {
    const entry = revenueData.find(d => d.abbreviation === abbr);
    return { value: abbr, label: entry ? entry.States : abbr };
  });

const typeOptions = Array.from(new Set(revenueData.map(d => d.Type)))
  .map(type => ({ value: type, label: type }));

const Analysis = () => {
  const [selectedState, setSelectedState] = useState(stateOptions[0]?.value || '');
  const [selectedYear, setSelectedYear] = useState(fiscalYears[0]);
  const [selectedType, setSelectedType] = useState(typeOptions[0]?.value || '');

  // Memoized calculations
  const totalRevenue = useMemo(() => {
    if (!selectedState || !selectedYear) return null;
    return getTotalRevenueByStateAndYear(selectedState, selectedYear);
  }, [selectedState, selectedYear]);

  const revenueTrend = useMemo(() => {
    if (!selectedState || !selectedType) return [];
    return getRevenueTrend(selectedState, selectedType);
  }, [selectedState, selectedType]);

  const cagr = useMemo(() => {
    if (!selectedState || !selectedType) return null;
    return getCAGR(selectedState, selectedType);
  }, [selectedState, selectedType]);

  const topTypes = useMemo(() => {
    if (!selectedState) return [];
    return getTopRevenueTypesByState(selectedState, 3);
  }, [selectedState]);

  const trendChartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    // Clean up previous chart
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }
    if (trendChartRef.current && revenueTrend && revenueTrend.length > 0) {
      chartInstanceRef.current = new Chart(trendChartRef.current, {
        type: 'bar',
        data: {
          labels: revenueTrend.map(rt => rt.year),
          datasets: [
            {
              label: `${selectedType} Revenue`,
              data: revenueTrend.map(rt => rt.value),
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false }
          }
        }
      });
    }
    // Cleanup on unmount
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [revenueTrend, selectedType]);

  return (
    <div className="analysis-page">
      <h1>Revenue Analysis</h1>
      <div className="analysis-controls">
        <div className="form-group">
          <label htmlFor="state-select">Select State</label>
          <select
            id="state-select"
            className="form-control"
            value={selectedState}
            onChange={e => setSelectedState(e.target.value)}
          >
            {stateOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="year-select">Select Year</label>
          <select
            id="year-select"
            className="form-control"
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
          >
            {fiscalYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="type-select">Select Revenue Type</label>
          <select
            id="type-select"
            className="form-control"
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
          >
            {typeOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="result-card">
        <h3>Revenue Trend Chart ({selectedType})</h3>
        <canvas ref={trendChartRef}></canvas>
      </div>
      
      <div className="analysis-results">
        <div className="result-card">
          <h3>Total Revenue ({selectedYear})</h3>
          <div className="result-value">₹{totalRevenue?.toLocaleString('en-IN') || 'N/A'} Cr</div>
        </div>
        <div className="result-card">
          <h3>Revenue Trend ({selectedType})</h3>
          <ul>
            {revenueTrend && revenueTrend.length > 0 ? (
              revenueTrend.map(rt => (
                <li key={rt.year}>
                {rt.year}: ₹
                {typeof rt.value === 'number' && !isNaN(rt.value)
                  ? rt.value.toLocaleString('en-IN')
                  : 'N/A'} Cr
              </li>
              ))
            ) : (
              <li>No trend data</li>
            )}
          </ul>
        </div>
        <div className="result-card">
          <h3>CAGR ({selectedType})</h3>
          <div className="result-value">{cagr !== null ? (cagr * 100).toFixed(2) + '%' : 'N/A'}</div>
        </div>
        <div className="result-card">
          <h3>Top 3 Revenue Types</h3>
          <ol>
            {topTypes && topTypes.length > 0 ? (
              topTypes.map(t => (
                <li key={t.Type}>
                  {t.Type}: ₹
                  {typeof t.total === 'number' && !isNaN(t.total)
                    ? t.total.toLocaleString('en-IN')
                    : 'N/A'} Cr
                </li>
              ))
            ) : (
              <li>No data</li>
            )}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
