import React, { useState } from 'react';

const Settings = () => {
  const [settings, setSettings] = useState({
    theme: 'system',
    currency: 'INR',
    notifications: true,
    compactMode: false,
    dataRefreshInterval: '5'
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    // In a real app, you would save these settings to local storage or a backend
    alert('Settings saved successfully!');
  };

  return (
    <div className="settings">
      <h2>Settings</h2>
      
      <form onSubmit={handleSave} className="settings-form">
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
        
        <div className="setting-group">
          <h3>Data & Currency</h3>
          <div className="form-group">
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
          </div>
          
          <div className="form-group">
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
          </div>
        </div>
        
        <div className="setting-group">
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
        </div>
        
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
