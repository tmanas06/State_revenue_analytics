import React, { useState, useMemo } from 'react';
import { formatCurrency } from '../utils/chartUtils';

const QuickSearch = ({ revenueData }) => {
  const [selectedYear, setSelectedYear] = useState('FY24');
  const [selectedState, setSelectedState] = useState('Odisha');
  const [selectedType, setSelectedType] = useState('Commercial Taxes');

  // Get unique values for dropdowns
  const { years, states, types } = useMemo(() => {
    const yearSet = new Set();
    const stateSet = new Set();
    const typeSet = new Set();

    revenueData.forEach(item => {
      stateSet.add(item.States);
      typeSet.add(item.Type);
      Object.keys(item).forEach(key => {
        if (key.startsWith('FY')) yearSet.add(key);
      });
    });

    return {
      years: Array.from(yearSet).sort(),
      states: Array.from(stateSet).sort(),
      types: Array.from(typeSet).sort()
    };
  }, [revenueData]);

  // Find the selected value
  const selectedValue = useMemo(() => {
    const item = revenueData.find(
      item => item.States === selectedState && item.Type === selectedType
    );
    return item ? item[selectedYear] : 'N/A';
  }, [selectedYear, selectedState, selectedType, revenueData]);

  return (
    <div className="quick-search-container">
      <h2>Quick Search</h2>
      <div className="search-filters">
        <div className="form-group">
          <label htmlFor="year">Financial Year:</label>
          <select
            id="year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="form-control"
          >
            {years.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="state">State:</label>
          <select
            id="state"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="form-control"
          >
            {states.map(state => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="type">Revenue Type:</label>
          <select
            id="type"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="form-control"
          >
            {types.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="search-result">
        <h3>Revenue Value:</h3>
        <div className="revenue-value">
          {selectedValue !== 'N/A' ? formatCurrency(selectedValue) : 'N/A'}
        </div>
        <div className="revenue-details">
          <p>
            <strong>State:</strong> {selectedState}
          </p>
          <p>
            <strong>Type:</strong> {selectedType}
          </p>
          <p>
            <strong>Year:</strong> {selectedYear}
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuickSearch;
