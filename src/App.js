import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import revenueData from './data/revenueData';

// Import components
import Overview from './components/Overview';
import Analysis from './components/Analysis';
import QuickSearch from './components/QuickSearch';
import CompareStates from './components/CompareStates';
import Settings from './components/Settings';

// Icons (using emoji as placeholders - in a real app, use an icon library)
const Icons = {
  Home: '🏠',
  Analysis: '📊',
  Search: '🔍',
  Compare: '🔄',
  Settings: '⚙️',
  Download: '⬇️',
  Menu: '☰',
  Close: '✕',
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
    <ThemeProvider>
      <Router>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </Router>
    </ThemeProvider>
  );
};



// Main Content Component
const AppContent = () => {
  const { darkMode } = useTheme();
  const location = useLocation();
  const [currentStateFilter, setCurrentStateFilter] = useState('Odisha');
  const [currentYearRange, setCurrentYearRange] = useState([0, 9]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 992);
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
      // Keep sidebar closed by default on mobile, open on desktop
      setIsSidebarOpen(window.innerWidth > 992);
    };
    
    handleResize(); // Set initial state
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentYear = new Date().getFullYear();

  // Function to handle Excel download
  const handleDownloadExcel = () => {
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    
    // Convert revenueData to worksheet
    const ws = XLSX.utils.json_to_sheet(revenueData);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Revenue Data');
    
    // Generate Excel file and trigger download
    XLSX.writeFile(wb, `Revenue_Data_${new Date().toISOString().split('T')[0]}.xlsx`);
  };
  

  // Constants
  const yearColumns = ['FY17', 'FY18', 'FY19', 'FY20', 'FY21', 'FY22', 'FY23', 'FY24', 'FY25-RE', 'FY26-BE'];
  
  // Navigation items
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Icons.Home, path: '/' },
    { id: 'quick-search', label: 'Quick Search', icon: Icons.Search, path: '/quick-search' },
    { id: 'analysis', label: 'Analysis', icon: Icons.Analysis, path: '/analysis' },
    { id: 'compare', label: 'Compare States', icon: Icons.Compare, path: '/compare' },
    { id: 'settings', label: 'Settings', icon: Icons.Settings, path: '/settings' }
  ];
  
  const toggleSidebar = (e) => {
    // Prevent event from bubbling up to parent elements
    if (e) {
      e.stopPropagation();
    }
    setIsSidebarOpen(prev => !prev);
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
      const sidebar = document.querySelector('.sidebar');
      const menuToggle = document.querySelector('.menu-toggle');
      
      if (window.innerWidth <= 992 && 
          isSidebarOpen && 
          sidebar && 
          menuToggle &&
          !sidebar.contains(e.target) && 
          !menuToggle.contains(e.target)) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarOpen]);

  return (
    <div className="app-container">
      <div className="app-layout">
        {/* Sidebar */}
        <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Revenue Dashboard</h2>
          <button 
            type="button" 
            className="sidebar-close" 
            onClick={(e) => {
              e.stopPropagation();
              setIsSidebarOpen(false);
            }}
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
            <button 
              type="button" 
              className="btn btn-icon" 
              title="Download Data"
              onClick={handleDownloadExcel}
            >
              {Icons.Download}
              <span className="tooltip">Download Full Data (Excel)</span>
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
              path="/analysis" 
              element={
                <>
                  <h1 className="page-title">Analysis</h1>
                  <Analysis 
                    currentStateFilter={currentStateFilter}
                    onStateChange={setCurrentStateFilter}
                    revenueData={revenueData}
                    charts={charts}
                    selectedYear="FY24"
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
      </div>
    </div>
  );
};

export default App;
