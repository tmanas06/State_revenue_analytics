import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ThemeProvider, useTheme } from './context/ThemeContext';

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
    <ThemeProvider>
      <Router>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </Router>
    </ThemeProvider>
  );
};

// Navigation items
const navItems = [
  { id: 'overview', label: 'Overview', icon: Icons.Home },
  { id: 'trends', label: 'Revenue Trends', icon: Icons.Trends },
  { id: 'analysis', label: 'Analysis', icon: Icons.Analysis },
  { id: 'compare', label: 'Compare States', icon: Icons.Compare },
  { id: 'settings', label: 'Settings', icon: Icons.Settings }
];

// Main Content Component
const AppContent = () => {
  const { darkMode } = useTheme();
  const location = useLocation();
  const [currentStateFilter, setCurrentStateFilter] = useState('both');
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

  // Revenue Data
  const revenueData = useMemo(() => [
    // Odisha
    {"Type":"Commercial Taxes","States":"Odisha","abbreviation":"OD","FY17":15343,"FY18":22736,"FY19":20399,"FY20":21008,"FY21":21195,"FY22":26757,"FY23":31020,"FY24":60618,"FY25-RE":40850,"FY26-BE":44720,"CAGR":0.13021280123110301},
    {"Type":"Excise","States":"Odisha","abbreviation":"OD","FY17":2832,"FY18":3251,"FY19":3946,"FY20":4515,"FY21":4074,"FY22":55570,"FY23":6455,"FY24":7215,"FY25-RE":8821,"FY26-BE":9987,"CAGR":0.1525985572744426},
    {"Type":"Electricity","States":"Odisha","abbreviation":"OD","FY17":1637,"FY18":1970,"FY19":3258,"FY20":2820,"FY21":3938,"FY22":3717,"FY23":4210,"FY24":4474,"FY25-RE":4252,"FY26-BE":4635,"CAGR":0.12672536689200387},
    {"Type":"Stamps and Registration","States":"Odisha","abbreviation":"OD","FY17":1364,"FY18":1037,"FY19":1237,"FY20":1435,"FY21":2942,"FY22":2419,"FY23":1997,"FY24":2127,"FY25-RE":2417,"FY26-BE":2610,"CAGR":0.07413232140731152},
    {"Type":"Transport (Taxes on vehicle)","States":"Odisha","abbreviation":"OD","FY17":1216,"FY18":1535,"FY19":1746,"FY20":1836,"FY21":1526,"FY22":1664,"FY23":2133,"FY24":2478,"FY25-RE":2700,"FY26-BE":3034,"CAGR":0.10485115405433709},
    {"Type":"Land Revenue","States":"Odisha","abbreviation":"OD","FY17":460,"FY18":542,"FY19":511,"FY20":721,"FY21":603,"FY22":664,"FY23":739,"FY24":1123,"FY25-RE":960,"FY26-BE":980,"CAGR":0.09632464035829336},
    {"Type":"Mining (Non-ferrous Mining and Metallurgical Industries)","States":"Odisha","abbreviation":"OD","FY17":4926,"FY18":6131,"FY19":10480,"FY20":11020,"FY21":13792,"FY22":48642,"FY23":37642,"FY24":45046,"FY25-RE":46600,"FY26-BE":47468,"CAGR":0.3243001817315496},
    {"Type":"Water Resource","States":"Odisha","abbreviation":"OD","FY17":776,"FY18":689,"FY19":677,"FY20":710,"FY21":808,"FY22":804,"FY23":924,"FY24":951,"FY25-RE":1020,"FY26-BE":1322,"CAGR":0.03476637154582196},
    {"Type":"Forest Resource","States":"Odisha","abbreviation":"OD","FY17":132,"FY18":63,"FY19":32,"FY20":28,"FY21":33,"FY22":38,"FY23":24,"FY24":19,"FY25-RE":46,"FY26-BE":48,"CAGR":-0.12345748095409281},
  
    // Uttar Pradesh
    {"Type":"Commercial Taxes","States":"Uttar Pradesh","abbreviation":"UP","FY17":51938,"FY18":68715,"FY19":72847,"FY20":67750,"FY21":64988,"FY22":81652,"FY23":96121,"FY24":106273,"FY25-RE":114675,"FY26-BE":175725,"CAGR":0.10407338505936692},
    {"Type":"Excise","States":"Uttar Pradesh","abbreviation":"UP","FY17":14998,"FY18":17625,"FY19":23942,"FY20":27334,"FY21":30067,"FY22":36320,"FY23":41259,"FY24":45574,"FY25-RE":48771,"FY26-BE":63000,"CAGR":0.1588201516690546},
    {"Type":"Electricity","States":"Uttar Pradesh","abbreviation":"UP","FY17":1555,"FY18":2124,"FY19":2978,"FY20":3452,"FY21":1586,"FY22":1366,"FY23":2519,"FY24":2712,"FY25-RE":3012,"FY26-BE":3500,"CAGR":0.08615191381699794},
    {"Type":"Stamps and Registration","States":"Uttar Pradesh","abbreviation":"UP","FY17":11564,"FY18":13397,"FY19":15733,"FY20":16069,"FY21":16475,"FY22":20048,"FY23":24844,"FY24":26961,"FY25-RE":30462,"FY26-BE":38150,"CAGR":0.12870718944736903},
    {"Type":"Transport (Taxes on vehicle)","States":"Uttar Pradesh","abbreviation":"UP","FY17":5148,"FY18":6403,"FY19":6929,"FY20":7714,"FY21":6482,"FY22":7776,"FY23":9059,"FY24":11205,"FY25-RE":11573,"FY26-BE":14000,"CAGR":0.10656244502312329},
    {"Type":"Land Revenue","States":"Uttar Pradesh","abbreviation":"UP","FY17":760,"FY18":133,"FY19":631,"FY20":503,"FY21":297,"FY22":193,"FY23":285,"FY24":405,"FY25-RE":464,"FY26-BE":625,"CAGR":-0.05981558344108062},
    {"Type":"Mining (Non-ferrous Mining and Metallurgical Industries)","States":"Uttar Pradesh","abbreviation":"UP","FY17":1548,"FY18":3258,"FY19":3165,"FY20":2180,"FY21":3112,"FY22":2655,"FY23":3352,"FY24":3987,"FY25-RE":4045,"FY26-BE":6000,"CAGR":0.12756982769954828},
    {"Type":"Water Resource","States":"Uttar Pradesh","abbreviation":"UP","FY17":689,"FY18":869,"FY19":812,"FY20":1024,"FY21":1174,"FY22":1120,"FY23":1280,"FY24":1340,"FY25-RE":1247,"FY26-BE":2015,"CAGR":0.07697569901745505},
    {"Type":"Forest Resource","States":"Uttar Pradesh","abbreviation":"UP","FY17":253,"FY18":320,"FY19":413,"FY20":312,"FY21":317,"FY22":335,"FY23":322,"FY24":357,"FY25-RE":433,"FY26-BE":625,"CAGR":0.06947570163072281},
  
    // Tamil Nadu
    {"Type":"Commercial Taxes","States":"Tamil Nadu","abbreviation":"TN","FY17":65785,"FY18":74581,"FY19":81896,"FY20":91901,"FY21":88953,"FY22":93967,"FY23":112971,"FY24":122167,"FY25-RE":141764,"FY26-BE":163930,"CAGR":0.1007276727669093},
    {"Type":"Excise","States":"Tamil Nadu","abbreviation":"TN","FY17":6659,"FY18":5954,"FY19":6863,"FY20":7186,"FY21":7782,"FY22":8277,"FY23":10478,"FY24":10834,"FY25-RE":11941,"FY26-BE":13028,"CAGR":0.07573168437324673},
    {"Type":"Electricity","States":"Tamil Nadu","abbreviation":"TN","FY17":1242,"FY18":1219,"FY19":621,"FY20":574,"FY21":482,"FY22":494,"FY23":1506,"FY24":5680,"FY25-RE":3988,"FY26-BE":4222,"CAGR":0.15698890484203165},
    {"Type":"Stamps and Registration","States":"Tamil Nadu","abbreviation":"TN","FY17":7237,"FY18":9195,"FY19":11066,"FY20":10856,"FY21":11675,"FY22":14331,"FY23":17560,"FY24":19013,"FY25-RE":22815,"FY26-BE":26110,"CAGR":0.1543373222080262},
    {"Type":"Transport (Taxes on vehicle)","States":"Tamil Nadu","abbreviation":"TN","FY17":4854,"FY18":5363,"FY19":5573,"FY20":5675,"FY21":4561,"FY22":5627,"FY23":7513,"FY24":9375,"FY25-RE":11998,"FY26-BE":13441,"CAGR":0.11976305819253463},
    {"Type":"Land Revenue","States":"Tamil Nadu","abbreviation":"TN","FY17":153,"FY18":152,"FY19":178,"FY20":258,"FY21":211,"FY22":205,"FY23":248,"FY24":256,"FY25-RE":319,"FY26-BE":235,"CAGR":0.09619396438783756},
    {"Type":"Mining (Non-ferrous Mining and Metallurgical Industries)","States":"Tamil Nadu","abbreviation":"TN","FY17":984,"FY18":1146,"FY19":1057,"FY20":1150,"FY21":765,"FY22":1005,"FY23":1200,"FY24":1550,"FY25-RE":1545,"FY26-BE":4980,"CAGR":0.05801463022972819},
    {"Type":"Water Resource","States":"Tamil Nadu","abbreviation":"TN","FY17":36,"FY18":34,"FY19":48,"FY20":51,"FY21":63,"FY22":69,"FY23":74,"FY24":130,"FY25-RE":166,"FY26-BE":160,"CAGR":0.21053039463431555},
    {"Type":"Forest Resource","States":"Tamil Nadu","abbreviation":"TN","FY17":34,"FY18":58,"FY19":145,"FY20":83,"FY21":95,"FY22":83,"FY23":113,"FY24":101,"FY25-RE":82,"FY26-BE":86,"CAGR":0.11632812585929342},
  
    // Rajasthan
    {"Type":"Commercial Taxes","States":"Rajasthan","abbreviation":"RJ","FY17":29362,"FY18":35223,"FY19":38680,"FY20":37838,"FY21":38279,"FY22":48278,"FY23":56525,"FY24":61489,"FY25-RE":7910102,"FY26-BE":9438103,"CAGR":1.0127950521006008},
    {"Type":"Excise","States":"Rajasthan","abbreviation":"RJ","FY17":7274,"FY18":7340,"FY19":8721,"FY20":9615,"FY21":9879,"FY22":11873,"FY23":13326,"FY24":13225,"FY25-RE":1700120,"FY26-BE":1972125,"CAGR":0.9773715665213412},
    {"Type":"Electricity","States":"Rajasthan","abbreviation":"RJ","FY17":738,"FY18":3377,"FY19":2148,"FY20":2263,"FY21":2142,"FY22":2606,"FY23":2625,"FY24":2918,"FY25-RE":310000,"FY26-BE":350000,"CAGR":1.1277135851633373},
    {"Type":"Stamps and Registration","States":"Rajasthan","abbreviation":"RJ","FY17":3234,"FY18":3675,"FY19":3886,"FY20":4235,"FY21":5297,"FY22":6492,"FY23":8189,"FY24":9181,"FY25-RE":1190000,"FY26-BE":1435000,"CAGR":1.0927910445891156},
    {"Type":"Transport (Taxes on vehicle)","States":"Rajasthan","abbreviation":"RJ","FY17":3623,"FY18":4363,"FY19":4576,"FY20":4951,"FY21":4368,"FY22":4759,"FY23":6128,"FY24":6704,"FY25-RE":850000,"FY26-BE":986000,"CAGR":0.9783076207121788},
    {"Type":"Land Revenue","States":"Rajasthan","abbreviation":"RJ","FY17":315,"FY18":364,"FY19":290,"FY20":364,"FY21":279,"FY22":631,"FY23":484,"FY24":469,"FY25-RE":77601,"FY26-BE":88111,"CAGR":0.9904193978757914},
    {"Type":"Mining (Non-ferrous Mining and Metallurgical Industries)","States":"Rajasthan","abbreviation":"RJ","FY17":4234,"FY18":4522,"FY19":5301,"FY20":4579,"FY21":4966,"FY22":6395,"FY23":7213,"FY24":7460,"FY25-RE":110000,"FY26-BE":1298000,"CAGR":0.502554484203722},
    {"Type":"Water Resource","States":"Rajasthan","abbreviation":"RJ","FY17":123,"FY18":287,"FY19":185,"FY20":84,"FY21":251,"FY22":206,"FY23":196,"FY24":173,"FY25-RE":25000,"FY26-BE":26235,"CAGR":0.9431412090894946},
    {"Type":"Forest Resource","States":"Rajasthan","abbreviation":"RJ","FY17":113,"FY18":182,"FY19":147,"FY20":109,"FY21":74,"FY22":120,"FY23":173,"FY24":140,"FY25-RE":17725,"FY26-BE":16275,"CAGR":0.8812151822806769},
  
    // Telangana
    {"Type":"Commercial Taxes","States":"Telangana","abbreviation":"TG","FY17":34245,"FY18":40333,"FY19":45168,"FY20":44778,"FY21":43622,"FY22":56478,"FY23":66601,"FY24":70088,"FY25-RE":79884,"FY26-BE":89379,"CAGR":0.11168777299271748},
    {"Type":"Excise","States":"Telangana","abbreviation":"TG","FY17":5915,"FY18":9541,"FY19":10653,"FY20":12015,"FY21":14379,"FY22":17512,"FY23":18496,"FY24":20301,"FY25-RE":25621,"FY26-BE":27627,"CAGR":0.20110276278184935},
    {"Type":"Electricity","States":"Telangana","abbreviation":"TG","FY17":514,"FY18":396,"FY19":15,"FY20":17,"FY21":20,"FY22":548,"FY23":886,"FY24":17,"FY25-RE":716,"FY26-BE":776,"CAGR":0.04230240034153887},
    {"Type":"Stamps and Registration","States":"Telangana","abbreviation":"TG","FY17":3821,"FY18":4202,"FY19":5344,"FY20":6671,"FY21":5243,"FY22":12373,"FY23":14228,"FY24":14296,"FY25-RE":14692,"FY26-BE":19087,"CAGR":0.1833493736642655},
    {"Type":"Transport (Taxes on vehicle)","States":"Telangana","abbreviation":"TG","FY17":3394,"FY18":3589,"FY19":3761,"FY20":3934,"FY21":3338,"FY22":4381,"FY23":6737,"FY24":7095,"FY25-RE":8478,"FY26-BE":8535,"CAGR":0.12123771270784789},
    {"Type":"Land Revenue","States":"Telangana","abbreviation":"TG","FY17":7,"FY18":4,"FY19":0,"FY20":1,"FY21":1,"FY22":0,"FY23":0,"FY24":0,"FY25-RE":11,"FY26-BE":11,"CAGR":0.05812464718163057},
    {"Type":"Mining (Non-ferrous Mining and Metallurgical Industries)","States":"Telangana","abbreviation":"TG","FY17":3148,"FY18":3592,"FY19":4646,"FY20":3487,"FY21":3457,"FY22":2296,"FY23":7494,"FY24":5440,"FY25-RE":6588,"FY26-BE":7585,"CAGR":0.09670508808126788},
    {"Type":"Water Resource","States":"Telangana","abbreviation":"TG","FY17":30,"FY18":21,"FY19":39,"FY20":33,"FY21":23,"FY22":31,"FY23":149,"FY24":23,"FY25-RE":99,"FY26-BE":99,"CAGR":0.16095194237873045},
    {"Type":"Forest Resource","States":"Telangana","abbreviation":"TG","FY17":93,"FY18":127,"FY19":60,"FY20":53,"FY21":27,"FY22":27,"FY23":305,"FY24":32,"FY25-RE":31,"FY26-BE":31,"CAGR":-0.12831445712826428},
  
    // Karnataka
    {"Type":"Commercial Taxes","States":"Karnataka","abbreviation":"KA","FY17":50310,"FY18":54723,"FY19":57815,"FY20":59775,"FY21":54881,"FY22":63765,"FY23":81987,"FY24":93188,"FY25-RE":105000,"FY26-BE":120000,"CAGR":0.0963314500184429},
    {"Type":"Excise","States":"Karnataka","abbreviation":"KA","FY17":17574,"FY18":18684,"FY19":19964,"FY20":21636,"FY21":23390,"FY22":24580,"FY23":29962,"FY24":34750,"FY25-RE":36575,"FY26-BE":43075,"CAGR":0.09594614684586467},
    {"Type":"Electricity","States":"Karnataka","abbreviation":"KA","FY17":1451,"FY18":1485,"FY19":2334,"FY20":2693,"FY21":2433,"FY22":2707,"FY23":3052,"FY24":3323,"FY25-RE":2006,"FY26-BE":1487,"CAGR":0.04131695448153483},
    {"Type":"Stamps and Registration","States":"Karnataka","abbreviation":"KA","FY17":7805,"FY18":9024,"FY19":10774,"FY20":11308,"FY21":10576,"FY22":12655,"FY23":17726,"FY24":20147,"FY25-RE":24000,"FY26-BE":28000,"CAGR":0.15074684215341527},
    {"Type":"Transport (Taxes on vehicle)","States":"Karnataka","abbreviation":"KA","FY17":5594,"FY18":6208,"FY19":6567,"FY20":6762,"FY21":5606,"FY22":7514,"FY23":10611,"FY24":11287,"FY25-RE":12500,"FY26-BE":12500,"CAGR":0.10572834788517227},
    {"Type":"Land Revenue","States":"Karnataka","abbreviation":"KA","FY17":208,"FY18":195,"FY19":144,"FY20":203,"FY21":183,"FY22":181,"FY23":364,"FY24":86021,"FY25-RE":362,"FY26-BE":613,"CAGR":0.07171831955925301},
    {"Type":"Mining (Non-ferrous Mining and Metallurgical Industries)","States":"Karnataka","abbreviation":"KA","FY17":2420,"FY18":2747,"FY19":3026,"FY20":3629,"FY21":3893,"FY22":6308,"FY23":5946,"FY24":7322,"FY25-RE":7250,"FY26-BE":9000,"CAGR":0.1470050501833149},
    {"Type":"Water Resource","States":"Karnataka","abbreviation":"KA","FY17":37,"FY18":36,"FY19":74,"FY20":14,"FY21":48,"FY22":18,"FY23":34,"FY24":1928,"FY25-RE":36,"FY26-BE":41,"CAGR":-0.0034190135899326846},
    {"Type":"Forest Resource","States":"Karnataka","abbreviation":"KA","FY17":291,"FY18":314,"FY19":309,"FY20":266,"FY21":275,"FY22":282,"FY23":325,"FY24":423,"FY25-RE":478,"FY26-BE":517,"CAGR":0.06400057694941386},
  
    // Andhra Pradesh
    {"Type":"Commercial Taxes","States":"Andhra Pradesh","abbreviation":"AP","FY17":32750,"FY18":3933,"FY19":43509,"FY20":41919,"FY21":36967,"FY22":44506,"FY23":46296,"FY24":49935,"FY25-RE":55117,"FY26-BE":62098,"CAGR":0.06723309265138},
    {"Type":"Excise","States":"Andhra Pradesh","abbreviation":"AP","FY17":4796,"FY18":5517,"FY19":6230,"FY20":6921,"FY21":11576,"FY22":14501,"FY23":14800,"FY24":15998,"FY25-RE":21301,"FY26-BE":27098,"CAGR":0.20486975365868676},
    {"Type":"Electricity","States":"Andhra Pradesh","abbreviation":"AP","FY17":333,"FY18":16,"FY19":11,"FY20":11,"FY21":13,"FY22":19,"FY23":4243,"FY24":5528,"FY25-RE":3008,"FY26-BE":510,"CAGR":0.3166768499920123},
    {"Type":"Stamps and Registration","States":"Andhra Pradesh","abbreviation":"AP","FY17":3476,"FY18":4271,"FY19":5428,"FY20":5318,"FY21":5603,"FY22":7500,"FY23":8022,"FY24":9542,"FY25-RE":9200,"FY26-BE":13150,"CAGR":0.12937587776993187},
    {"Type":"Transport (Taxes on vehicle)","States":"Andhra Pradesh","abbreviation":"AP","FY17":2467,"FY18":3039,"FY19":3341,"FY20":3279,"FY21":2966,"FY22":4100,"FY23":4320,"FY24":4557,"FY25-RE":4655,"FY26-BE":5664,"CAGR":0.08260197982494932},
    {"Type":"Land Revenue","States":"Andhra Pradesh","abbreviation":"AP","FY17":167,"FY18":107,"FY19":57,"FY20":21,"FY21":143,"FY22":80,"FY23":110,"FY24":52,"FY25-RE":1342,"FY26-BE":222,"CAGR":0.29756614444909557},
    {"Type":"Mining (Non-ferrous Mining and Metallurgical Industries)","States":"Andhra Pradesh","abbreviation":"AP","FY17":1628,"FY18":2156,"FY19":2211,"FY20":1897,"FY21":2256,"FY22":3550,"FY23":3024,"FY24":3060,"FY25-RE":3518,"FY26-BE":6000,"CAGR":0.10110866261291585},
    {"Type":"Water Resource","States":"Andhra Pradesh","abbreviation":"AP","FY17":171,"FY18":171,"FY19":126,"FY20":130,"FY21":119,"FY22":150,"FY23":38,"FY24":22,"FY25-RE":137,"FY26-BE":296,"CAGR":-0.027329919526851043},
    {"Type":"Forest Resource","States":"Andhra Pradesh","abbreviation":"AP","FY17":234,"FY18":342,"FY19":426,"FY20":36,"FY21":31,"FY22":200,"FY23":211,"FY24":108,"FY25-RE":37,"FY26-BE":519,"CAGR":-0.2059035887348376},
  
    // Gujrat
    {"Type":"Commercial Taxes","States":"Gujrat","abbreviation":"GJ","FY17":46629,"FY18":53378,"FY19":58185,"FY20":55486,"FY21":48620,"FY22":72799,"FY23":89448,"FY24":91638,"FY25-RE":108374,"FY26-BE":113562,"CAGR":0.11117797665164098},
    {"Type":"Excise","States":"Gujrat","abbreviation":"GJ","FY17":725,"FY18":497,"FY19":508,"FY20":511,"FY21":485,"FY22":490,"FY23":601,"FY24":926,"FY25-RE":846,"FY26-BE":896,"CAGR":0.01948078470785619},
    {"Type":"Electricity","States":"Gujrat","abbreviation":"GJ","FY17":5833,"FY18":6484,"FY19":7348,"FY20":8774,"FY21":8319,"FY22":7012,"FY23":10594,"FY24":11514,"FY25-RE":11749,"FY26-BE":12117,"CAGR":0.09147455562392182},
    {"Type":"Stamps and Registration","States":"Gujrat","abbreviation":"GJ","FY17":5783,"FY18":7255,"FY19":7781,"FY20":7701,"FY21":7390,"FY22":10432,"FY23":14207,"FY24":15334,"FY25-RE":16500,"FY26-BE":19800,"CAGR":0.14003016800245227},
    {"Type":"Transport (Taxes on vehicle)","States":"Gujrat","abbreviation":"GJ","FY17":3213,"FY18":3885,"FY19":4119,"FY20":3847,"FY21":2982,"FY22":3888,"FY23":5002,"FY24":5568,"FY25-RE":5677,"FY26-BE":6200,"CAGR":0.07374467012281039},
    {"Type":"Land Revenue","States":"Gujrat","abbreviation":"GJ","FY17":1998,"FY18":1859,"FY19":2408,"FY20":2359,"FY21":2134,"FY22":2782,"FY23":4481,"FY24":8558,"FY25-RE":4004,"FY26-BE":5181,"CAGR":0.09078039377052916},
    {"Type":"Mining (Non-ferrous Mining and Metallurgical Industries)","States":"Gujrat","abbreviation":"GJ","FY17":3747,"FY18":8989,"FY19":4863,"FY20":4148,"FY21":2907,"FY22":4321,"FY23":5859,"FY24":5815,"FY25-RE":5576,"FY26-BE":6500,"CAGR":0.050944747556279424},
    {"Type":"Water Resource","States":"Gujrat","abbreviation":"GJ","FY17":1100,"FY18":1217,"FY19":1379,"FY20":1463,"FY21":1704,"FY22":1782,"FY23":1807,"FY24":2104,"FY25-RE":2070,"FY26-BE":2952,"CAGR":0.08223657595616696},
    {"Type":"Forest Resource","States":"Gujrat","abbreviation":"GJ","FY17":46,"FY18":55,"FY19":46,"FY20":84,"FY21":35,"FY22":33,"FY23":31,"FY24":45,"FY25-RE":30,"FY26-BE":35,"CAGR":-0.052028179000872865},
  
    // Maharashtra
    {"Type":"Commercial Taxes","States":"Maharashtra","abbreviation":"MH","FY17":85363,"FY18":111900,"FY19":122325,"FY20":123663,"FY21":105595,"FY22":146272,"FY23":180337,"FY24":198810,"FY25-RE":240813,"FY26-BE":252279,"CAGR":0.13841676373185807},
    {"Type":"Excise","States":"Maharashtra","abbreviation":"MH","FY17":15031,"FY18":15024,"FY19":16674,"FY20":16338,"FY21":16184,"FY22":18585,"FY23":22970,"FY24":24378,"FY25-RE":32470,"FY26-BE":34643,"CAGR":0.10106206911605087},
    {"Type":"Electricity","States":"Maharashtra","abbreviation":"MH","FY17":6670,"FY18":7345,"FY19":10085,"FY20":9619,"FY21":8354, "FY22":8384,"FY23":14721,"FY24":12672,"FY25-RE":14180,"FY26-BE":16016,"CAGR":0.09886363050231317},
    {"Type":"Stamps and Registration","States":"Maharashtra","abbreviation":"MH","FY17":21012,"FY18":26442,"FY19":28545,"FY20":28707,"FY21":25428,"FY22":35594,"FY23":45286,"FY24":50824,"FY25-RE":60000,"FY26-BE":63500,"CAGR":0.14014603763592404},
    {"Type":"Transport (Taxes on vehicle)","States":"Maharashtra","abbreviation":"MH","FY17":6741,"FY18":8665,"FY19":8613,"FY20":8467,"FY21":6655,"FY22":9080,"FY23":11740,"FY24":12969,"FY25-RE":14875,"FY26-BE":15606,"CAGR":0.1039936639857022},
    {"Type":"Land Revenue","States":"Maharashtra","abbreviation":"MH","FY17":1799,"FY18":2310,"FY19":2088,"FY20":2155,"FY21":2063,"FY22":3065,"FY23":2431,"FY24":2690,"FY25-RE":5000,"FY26-BE":5500,"CAGR":0.13629829525741655},
    {"Type":"Mining (Non-ferrous Mining and Metallurgical Industries)","States":"Maharashtra","abbreviation":"MH","FY17":3105,"FY18":3556,"FY19":4057,"FY20":3982,"FY21":3918,"FY22":4885,"FY23":5578,"FY24":6933,"FY25-RE":8942,"FY26-BE":10579,"CAGR":0.14135733090864555},
    {"Type":"Water Resource","States":"Maharashtra","abbreviation":"MH","FY17":383,"FY18":274,"FY19":349,"FY20":178,"FY21":170,"FY22":461,"FY23":377,"FY24":427,"FY25-RE":4130,"FY26-BE":4130,"CAGR":0.3461514077718444},
    {"Type":"Forest Resource","States":"Maharashtra","abbreviation":"MH","FY17":177,"FY18":143,"FY19":297,"FY20":284,"FY21":331,"FY22":205,"FY23":310,"FY24":446,"FY25-RE":446,"FY26-BE":468,"CAGR":0.12245825701775725}
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
    <div className={`app-container ${darkMode ? 'dark' : ''}`}>
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
                    onStateChange={setCurrentStateFilter}
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
      </div>
    </div>
  );
};

export default App;
