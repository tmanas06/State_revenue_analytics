import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';

// Import components
import Overview from './components/Overview';
import RevenueTrends from './components/RevenueTrends';
import Analysis from './components/Analysis';
import CompareStates from './components/CompareStates';
import Settings from './components/Settings';
import QuickSearch from './components/QuickSearch';

// Icons (using emoji as placeholders - in a real app, use an icon library)
const Icons = {
  Home: '🏠',
  Search: '🔍',
  Trends: '📈',
  Analysis: '📊',
  Compare: '🔄',
  Settings: '⚙️',
  Menu: '☰',
  Close: '✕',
  Download: '⬇️',
  Refresh: '🔄',
  Info: 'ℹ️'
};

/**
 * Error Boundary Component
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong.</h2>
          <p>Please refresh the page or try again later.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// Main App Component with Router
const App = () => {
  return (
    <ErrorBoundary>
      <Router>
        <AppContent />
      </Router>
    </ErrorBoundary>
  );
};

// Main Content Component
const AppContent = () => {
  const location = useLocation();
  const [currentStateFilter, setCurrentStateFilter] = useState('both');
  const [currentYearRange, setCurrentYearRange] = useState([0, 9]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [activeNav, setActiveNav] = useState(location.pathname.substring(1) || 'overview');
  const charts = useMemo(() => ({}), []);
  
  // Set active nav based on current route
  useEffect(() => {
    const currentPath = location.pathname === '/' ? 'overview' : location.pathname.substring(1);
    setActiveNav(currentPath);
    // Update document title
    const currentPage = navItems.find(item => item.id === currentPath);
    if (currentPage) {
      document.title = `${currentPage.label} | Government Revenue Dashboard`;
    }
  }, [location]);

  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth > 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentYear = new Date().getFullYear();

  // Revenue Data
  const revenueData = useMemo(() => [
    {"Type":"Commercial Taxes","States":"Odisha","abbreviation":"OD","FY17":15343,"FY18":22736,"FY19":20399,"FY20":21008,"FY21":21195,"FY22":26757,"FY23":31020,"FY24":60618,"FY25-RE":40850,"FY26-BE":44720,"CAGR":0.1302},
    {"Type":"Excise","States":"Odisha","abbreviation":"OD","FY17":2832,"FY18":3251,"FY19":3946,"FY20":4515,"FY21":4074,"FY22":5570,"FY23":6455,"FY24":7215,"FY25-RE":8821,"FY26-BE":9987,"CAGR":0.1526},
    {"Type":"Electricity","States":"Odisha","abbreviation":"OD","FY17":1637,"FY18":1970,"FY19":3258,"FY20":2820,"FY21":3938,"FY22":3717,"FY23":4210,"FY24":4474,"FY25-RE":4252,"FY26-BE":4635,"CAGR":0.1267},
    // Add Uttar Pradesh data
    {"Type":"Commercial Taxes","States":"Uttar Pradesh","abbreviation":"UP","FY17":45343,"FY18":52736,"FY19":50399,"FY20":51008,"FY21":51195,"FY22":56757,"FY23":61020,"FY24":80618,"FY25-RE":70850,"FY26-BE":74720,"CAGR":0.1102},
    {"Type":"Excise","States":"Uttar Pradesh","abbreviation":"UP","FY17":12832,"FY18":13251,"FY19":13946,"FY20":14515,"FY21":14074,"FY22":15570,"FY23":16455,"FY24":17215,"FY25-RE":18821,"FY26-BE":19987,"CAGR":0.1226},
    {"Type":"Electricity","States":"Uttar Pradesh","abbreviation":"UP","FY17":11637,"FY18":11970,"FY19":13258,"FY20":12820,"FY21":13938,"FY22":13717,"FY23":14210,"FY24":14474,"FY25-RE":14252,"FY26-BE":14635,"CAGR":0.0967}
  ], []);

  // Constants
  const yearColumns = ['FY17', 'FY18', 'FY19', 'FY20', 'FY21', 'FY22', 'FY23', 'FY24', 'FY25-RE', 'FY26-BE'];
  
  // Navigation items
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Icons.Home, path: '/' },
    { id: 'quick-search', label: 'Quick Search', icon: Icons.Search, path: '/quick-search' },
    { id: 'trends', label: 'Revenue Trends', icon: Icons.Trends, path: '/trends' },
    { id: 'analysis', label: 'Analysis', icon: Icons.Analysis, path: '/analysis' },
    { id: 'compare', label: 'Compare States', icon: Icons.Compare, path: '/compare' },
    { id: 'settings', label: 'Settings', icon: Icons.Settings, path: '/settings' }
  ];
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  // Cleanup function to destroy charts on unmount
  useEffect(() => {
    return () => {
      Object.values(charts).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
          chart.destroy();
        }
      });
    };
  }, [charts]);

  // Chart colors
  const chartColors = ['#1FB8CD', '#FFC185', '#B4413C', '#5D878F', '#D2BA4C', '#944454', '#6A8EAE', '#A37A74', '#3A7D44', '#4C2C69'];
  
  // Format currency utility function
  const formatCurrency = (value) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L Cr`;
    }
    return `₹${value.toLocaleString()} Cr`;
  };
  
  // Format percentage utility function
  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (window.innerWidth <= 992 && isSidebarOpen && !e.target.closest('.sidebar')) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidebarOpen]);

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Revenue Dashboard</h2>
          <button 
            type="button" 
            className="sidebar-toggle" 
            onClick={toggleSidebar}
            aria-label="Close sidebar"
          >
            {Icons.Close}
          </button>
        </div>
        <nav className="sidebar-nav">
          <ul>
            {navItems.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={`nav-link ${activeNav === item.id ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-bar">
          <button 
            type="button" 
            className="menu-toggle" 
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            {Icons.Menu}
          </button>
          <h1>Government Revenue Analytics</h1>
          <div className="user-actions">
            <button type="button" className="btn btn-icon" title="Refresh">
              {Icons.Refresh}
            </button>
            <button type="button" className="btn btn-icon" title="Download">
              {Icons.Download}
            </button>
          </div>
        </header>

        <div className="content-container">
          <Routes>
            <Route 
              path="/" 
              element={
                <>
                  <h1 className="page-title">Overview</h1>
                  <Overview 
                    currentStateFilter={currentStateFilter}
                    setCurrentStateFilter={setCurrentStateFilter}
                    currentYearRange={currentYearRange}
                    setCurrentYearRange={setCurrentYearRange}
                    revenueData={revenueData}
                    charts={charts}
                  />
                </>
              } 
            />
            <Route 
              path="/quick-search" 
              element={
                <>
                  <h1 className="page-title">Quick Search</h1>
                  <QuickSearch revenueData={revenueData} />
                </>
              } 
            />
            <Route 
              path="/trends" 
              element={
                <>
                  <h1 className="page-title">Revenue Trends</h1>
                  <RevenueTrends 
                    currentStateFilter={currentStateFilter}
                    currentYearRange={currentYearRange}
                    revenueData={revenueData}
                    charts={charts}
                  />
                </>
              } 
            />
            <Route 
              path="/analysis" 
              element={
                <>
                  <h1 className="page-title">Analysis</h1>
                  <Analysis 
                    currentStateFilter={currentStateFilter}
                    revenueData={revenueData}
                    charts={charts}
                  />
                </>
              } 
            />
            <Route 
              path="/compare" 
              element={
                <>
                  <h1 className="page-title">Compare States</h1>
                  <CompareStates 
                    revenueData={revenueData}
                    yearColumns={yearColumns}
                    formatCurrency={formatCurrency}
                    formatPercentage={formatPercentage}
                    charts={charts}
                  />
                </>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <>
                  <h1 className="page-title">Settings</h1>
                  <Settings 
                    currentStateFilter={currentStateFilter}
                    setCurrentStateFilter={setCurrentStateFilter}
                    currentYearRange={currentYearRange}
                    setCurrentYearRange={setCurrentYearRange}
                  />
                </>
              } 
            />
          </Routes>
        </div>
      </main>
      <footer className="main-footer">
        <div className="footer-content">
          <p> {currentYear} Government Revenue Dashboard. Data for demonstration purposes only.</p>
          <div className="footer-links">
            <a href="#" className="footer-link">Help</a>
            <a href="#" className="footer-link">About</a>
            <a href="#" className="footer-link">Privacy</a>
            <a href="#" className="footer-link">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
