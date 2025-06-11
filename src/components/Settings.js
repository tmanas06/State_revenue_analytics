import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import './Settings.css';

const Settings = ({ currentStateFilter, setCurrentStateFilter, currentYearRange, setCurrentYearRange }) => {
  const { theme, setTheme, darkMode } = useTheme();
  const [settings, setSettings] = useState({
    theme: theme,
    currency: 'INR',
    notifications: true,
    compactMode: false,
    dataRefreshInterval: '5',
    selectedState: currentStateFilter,
    startYear: currentYearRange[0],
    endYear: currentYearRange[1]
  });
  
  // Update local theme when context theme changes
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      theme: theme
    }));
  }, [theme]);
  
  // Update local state when props change
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      selectedState: currentStateFilter,
      startYear: currentYearRange[0],
      endYear: currentYearRange[1]
    }));
  }, [currentStateFilter, currentYearRange]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setSettings(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Update theme immediately when changed
    if (name === 'theme') {
      setTheme(newValue);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    // Update the parent component's state
    setCurrentStateFilter(settings.selectedState);
    setCurrentYearRange([settings.startYear, settings.endYear]);
    
    // Save other settings to localStorage
    const settingsToSave = {
      theme: settings.theme,
      currency: settings.currency,
      notifications: settings.notifications,
      compactMode: settings.compactMode,
      dataRefreshInterval: settings.dataRefreshInterval
    };
    localStorage.setItem('appSettings', JSON.stringify(settingsToSave));
    
    alert('Settings saved successfully!');
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h2>Settings</h2>
        <div className="dark-mode-toggle">
          <span>Dark Mode</span>
          <button 
            type="button" 
            className={`toggle-btn ${darkMode ? 'active' : ''}`}
            onClick={() => setTheme(darkMode ? 'light' : 'dark')}
            aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
            aria-pressed={darkMode}
          >
            <span className="toggle-slider"></span>
          </button>
        </div>
      </div>
      
      <form onSubmit={handleSave} className="settings-form">
        <div className="setting-group">
          <h3>Default View</h3>
          <div className="form-group">
            <label htmlFor="selectedState">Default State</label>
            <select 
              id="selectedState" 
              name="selectedState" 
              value={settings.selectedState}
              onChange={handleChange}
              className="form-control"
            >
              <option value="all">All States</option>
              <option value="odisha">Odisha</option>
              <option value="uttar-pradesh">Uttar Pradesh</option>
              <option value="tamil-nadu">Tamil Nadu</option>
              <option value="rajasthan">Rajasthan</option>
              <option value="telangana">Telangana</option>
              <option value="karnataka">Karnataka</option>
              <option value="andhra-pradesh">Andhra Pradesh</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Default Year Range</label>
            <div className="year-range-inputs">
              <select 
                name="startYear" 
                value={settings.startYear}
                onChange={handleChange}
                className="form-control"
              >
                {Array.from({length: 10}, (_, i) => 2017 + i).map(year => (
                  <option key={year} value={year - 2017}>{year}</option>
                ))}
              </select>
              <span>to</span>
              <select 
                name="endYear" 
                value={settings.endYear}
                onChange={handleChange}
                className="form-control"
              >
                {Array.from({length: 10}, (_, i) => 2017 + i).map(year => (
                  <option key={year} value={year - 2017}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="setting-group">
          <h3>Appearance</h3>
          <div className="form-group">
            <label htmlFor="theme">Theme</label>
            <select 
              id="theme" 
              name="theme" 
              value={settings.theme}
              onChange={handleChange}
              className="form-control"
            >
              <option value="system">System Default</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>
              <input 
                type="checkbox" 
                name="compactMode" 
                checked={settings.compactMode}
                onChange={handleChange}
                className="form-checkbox"
              />
              <span>Compact Mode</span>
            </label>
            <small className="text-muted">Reduce padding and spacing for more content</small>
          </div>
        </div>
        
        {/* <div className="setting-group"> */}
          {/* <h3>Data & Currency</h3> */}
          {/* <div className="form-group">
            <label htmlFor="currency">Currency</label>
            <select 
              id="currency" 
              name="currency" 
              value={settings.currency}
              onChange={handleChange}
              className="form-control"
            >
              <option value="INR">Indian Rupee (₹)</option>
              <option value="USD">US Dollar ($)</option>
              <option value="EUR">Euro (€)</option>
            </select>
          </div> */}
          
          {/* <div className="form-group">
            <label htmlFor="dataRefreshInterval">Data Refresh Interval (minutes)</label>
            <select 
              id="dataRefreshInterval" 
              name="dataRefreshInterval" 
              value={settings.dataRefreshInterval}
              onChange={handleChange}
              className="form-control"
            >
              <option value="1">1 minute</option>
              <option value="5">5 minutes</option>
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="0">Manual refresh only</option>
            </select>
          </div> */}
        {/* </div> */}
        
        {/* <div className="setting-group">
          <h3>Notifications</h3>
          <div className="form-group">
            <label>
              <input 
                type="checkbox" 
                name="notifications" 
                checked={settings.notifications}
                onChange={handleChange}
                className="form-checkbox"
              />
              <span>Enable Notifications</span>
            </label>
          </div>
        </div> */}
        
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Save Changes
          </button>
          <button type="button" className="btn btn-outline">
            Reset to Defaults
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
