import { useState, useEffect, useMemo } from 'react';
import { DollarSign, Package, TrendingUp, TrendingDown, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { 
  ComposedChart, Bar, Line, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart
} from 'recharts';
import { 
  initTradeData,
  getMonthlyAggregates,
  getCategoryAggregates,
  getDataByCategory,
  getTradeGroups,
  getCommoditiesByCategory,
  getTimeSeriesData,
  isDataInitialized
} from '../data/tradeData';
import KPICard from '../components/KPICard';
import CategorySelector from '../components/CatagorySelector';
import CurrencyToggle from '../components/CurrencyToggle';

// Constants
const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#a4de6c', '#d0ed57', '#ffc658'];

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label, currency }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-900 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.name.includes('Value') || entry.name.includes('Imports') || entry.name.includes('Exports')
              ? formatValue(entry.value, currency)
              : formatVolume(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Utilities
const formatValue = (value, currency) => {
  if (!value || value === 0) return currency === 'USD' ? '$0' : 'Rs0';
  if (currency === 'USD') {
    if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  } else {
    if (Math.abs(value) >= 1000000000) return `Rs${(value / 1000000000).toFixed(2)}B`;
    if (Math.abs(value) >= 1000000) return `Rs${(value / 1000000).toFixed(2)}M`;
    if (Math.abs(value) >= 1000) return `Rs${(value / 1000).toFixed(2)}K`;
    return `Rs${value.toFixed(2)}`;
  }
};

const formatVolume = (value) => {
  if (!value || value === 0) return '0 MT';
  if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M MT`;
  if (value >= 1000) return `${(value / 1000).toFixed(2)}K MT`;
  return `${value.toFixed(2)} MT`;
};

const Dashboard = () => {
  // State declarations
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currency, setCurrency] = useState('PKR');
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [groupOptions, setGroupOptions] = useState(['all']);

  // Data fetching effect
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        await initTradeData();
        if (!isMounted) return;

        const monthly = getMonthlyAggregates();
        const category = getCategoryAggregates();
        const availableGroups = getTradeGroups() || [];

        if (!isMounted) return;

        if (!monthly?.length || !category?.length) {
          throw new Error('No trade data available');
        }

        if (isMounted) {
          setMonthlyData(monthly);
          setCategoryData(category);
          setGroupOptions(['all', ...(Array.isArray(availableGroups) ? availableGroups : [])]);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error loading trade data:', err);
          setError(err.message || 'Failed to load trade data');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Data processing - filtered by category if selected
  const chartData = useMemo(() => {
    if (!monthlyData?.length || !categoryData?.length) {
      return null;
    }

    // Filter data based on selected category
    let filteredMonthly = monthlyData;
    let filteredCategoryData = categoryData;
    
    if (selectedCategory !== 'all') {
      // If we have monthlyData and categoryData, data is initialized
      // Get monthly data for selected category
      try {
        const categoryMonthly = getTimeSeriesData(selectedCategory);
        filteredMonthly = categoryMonthly.map(item => ({
          month: item.month,
          imports: item.imports || 0,
          exports: item.exports || 0,
          importsUSD: item.importsUSD || 0,
          exportsUSD: item.exportsUSD || 0,
          quantity: item.quantity || 0,
          balance: item.balance || 0,
          balanceUSD: item.balanceUSD || 0,
          total: item.total || 0,
          totalUSD: item.totalUSD || 0
        }));
      } catch (err) {
        console.warn('Error getting category monthly data, using existing monthlyData:', err);
        // If error occurs, use existing monthlyData (which is already filtered)
        // This shouldn't happen if data is properly initialized, but handle gracefully
      }

      // Get category-specific data
      const selectedCatData = categoryData.find(cat => cat.category === selectedCategory);
      if (selectedCatData) {
        filteredCategoryData = [selectedCatData];
      }
    }

    // Process monthly data with proper currency handling
    const monthlyTrends = filteredMonthly.map(item => ({
      ...item,
      Value: currency === 'USD' ? item.totalUSD : item.total,
      Imports: currency === 'USD' ? item.importsUSD : item.imports,
      Exports: currency === 'USD' ? item.exportsUSD : item.exports,
      Balance: currency === 'USD' ? item.balanceUSD : item.balance,
    }));

    // Process categories with proper currency handling
    const processedCategories = [...filteredCategoryData]
      .map(item => ({
        ...item,
        Value: currency === 'USD' ? item.totalUSD : item.total,
        Imports: currency === 'USD' ? item.importsUSD : item.imports,
        Exports: currency === 'USD' ? item.exportsUSD : item.exports,
        Balance: currency === 'USD' ? item.balanceUSD : item.balance,
      }))
      .sort((a, b) => (b.Value || 0) - (a.Value || 0));

    const top6 = processedCategories.slice(0, 6);
    const others = processedCategories.slice(6);

    // Calculate totals
    const totalQuantity = processedCategories.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const totalImports = processedCategories.reduce((sum, item) => sum + (item.Imports || 0), 0);
    const totalExports = processedCategories.reduce((sum, item) => sum + (item.Exports || 0), 0);
    const totalValue = processedCategories.reduce((sum, item) => sum + (item.Value || 0), 0);
    const netBalance = totalExports - totalImports;

    // Calculate trend (compare last 2 months if available)
    const calculateTrend = (current, previous) => {
      if (!previous || previous === 0) return 0;
      return ((current - previous) / previous) * 100;
    };

    const lastMonth = monthlyTrends[monthlyTrends.length - 1];
    const prevMonth = monthlyTrends[monthlyTrends.length - 2];
    const valueTrend = calculateTrend(lastMonth?.Value || 0, prevMonth?.Value || 0);

    // Add "Others" category if there are more than 6 categories
    const othersValue = others.length > 0 ? others.reduce((sum, item) => sum + (item.Value || 0), 0) : 0;
    const categoriesList = [
      ...top6,
      ...(others.length > 0 && othersValue > 0 ? [{
        category: 'Others',
        Value: othersValue,
        quantity: others.reduce((sum, item) => sum + (item.quantity || 0), 0),
        Imports: others.reduce((sum, item) => sum + (item.Imports || 0), 0),
        Exports: others.reduce((sum, item) => sum + (item.Exports || 0), 0),
      }] : [])
    ];

    return {
      monthly: monthlyTrends,
      categories: categoriesList,
      totals: { 
        quantity: totalQuantity, 
        value: totalValue,
        imports: totalImports,
        exports: totalExports,
        balance: netBalance
      },
      trend: valueTrend
    };
  }, [monthlyData, categoryData, currency, selectedCategory]);

  // Compute commodities data for pie chart when a category is selected
  const commoditiesChartData = useMemo(() => {
    if (selectedCategory === 'all' || !isDataInitialized()) {
      return null;
    }

    try {
      const commodities = getCommoditiesByCategory(selectedCategory);
      if (!commodities || commodities.length === 0) {
        return null;
      }

      // Format commodities for pie chart
      const formatted = commodities.map(item => ({
        name: item.commodity,
        value: currency === 'USD' ? item.totalUSD : item.total,
        quantity: item.quantity,
        imports: currency === 'USD' ? item.importsUSD : item.imports,
        exports: currency === 'USD' ? item.exportsUSD : item.exports,
      }));

      // Sort by value and take top 6, combine the rest
      const sorted = formatted.sort((a, b) => (b.value || 0) - (a.value || 0));
      const topCommodities = sorted.slice(0, 6);
      const others = sorted.slice(6);

      if (others.length > 0) {
        const othersTotal = others.reduce((sum, item) => sum + (item.value || 0), 0);
        return [
          ...topCommodities,
          {
            name: 'Others',
            value: othersTotal,
            quantity: others.reduce((sum, item) => sum + (item.quantity || 0), 0),
            imports: others.reduce((sum, item) => sum + (item.imports || 0), 0),
            exports: others.reduce((sum, item) => sum + (item.exports || 0), 0),
          }
        ];
      }

      return topCommodities;
    } catch (error) {
      console.error('Error getting commodities data:', error);
      return null;
    }
  }, [selectedCategory, currency]);

  // Loading state check
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Loading Trade Intelligence...</p>
          <p className="text-sm text-gray-500 mt-2">Analyzing import and export data</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Data availability check
  if (!chartData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center text-red-600">
          <h2 className="text-2xl font-bold mb-2">No Data Available</h2>
          <p>No trade data could be processed. Please try again.</p>
        </div>
      </div>
    );
  }

  // Destructure chart data for use in render
  const { monthly, categories, totals, trend } = chartData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                  Pakistan Trade Intelligence Dashboard
                </h1>
                {selectedCategory !== 'all' && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                    Filtered: {selectedCategory}
                  </span>
                )}
              </div>
              <p className="text-gray-600">
                {selectedCategory !== 'all' 
                  ? `Focused analysis of ${selectedCategory} category trade data`
                  : 'Comprehensive analysis of imports and exports data'}
              </p>
            </div>
            <div className="flex flex-wrap gap-4 mt-4 lg:mt-0">
              <CategorySelector 
                categories={groupOptions}
                selected={selectedCategory}
                onChange={setSelectedCategory}
              />
              <CurrencyToggle 
                currency={currency}
                onChange={setCurrency}
              />
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Total Exports"
            value={formatValue(totals.exports, currency)}
            icon={ArrowUpCircle}
            trend={trend > 0 ? trend : 0}
            trendLabel="vs last month"
            color="green"
          />
          <KPICard
            title="Total Imports"
            value={formatValue(totals.imports, currency)}
            icon={ArrowDownCircle}
            trend={trend < 0 ? Math.abs(trend) : 0}
            trendLabel="vs last month"
            color="blue"
          />
          <KPICard
            title="Trade Balance"
            value={formatValue(totals.balance, currency)}
            icon={totals.balance >= 0 ? TrendingUp : TrendingDown}
            trend={totals.balance >= 0 ? 0 : 0}
            trendLabel={totals.balance >= 0 ? "Surplus" : "Deficit"}
            color={totals.balance >= 0 ? "green" : "red"}
          />
          <KPICard
            title="Total Volume"
            value={formatVolume(totals.quantity)}
            icon={Package}
            trend={5.2}
            trendLabel="growth"
            color="purple"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trade Trend Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Monthly Trade Overview</h3>
            <p className="text-sm text-gray-500 mb-4">Imports vs Exports over time</p>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={monthly}>
                <defs>
                  <linearGradient id="importsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="exportsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  yAxisId="value"
                  orientation="left"
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  tickFormatter={(value) => formatValue(value, currency)}
                />
                <Tooltip content={<CustomTooltip currency={currency} />} />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />
                <Bar 
                  yAxisId="value" 
                  dataKey="Imports" 
                  fill="url(#importsGradient)" 
                  name="Imports"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  yAxisId="value" 
                  dataKey="Exports" 
                  fill="url(#exportsGradient)" 
                  name="Exports"
                  radius={[4, 4, 0, 0]}
                />
                <Line 
                  yAxisId="value" 
                  type="monotone" 
                  dataKey="Balance" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  dot={{ fill: '#6366f1', r: 4 }}
                  name="Net Balance"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Category Distribution or Commodities Distribution Pie Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            {selectedCategory === 'all' ? (
              <>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Category Distribution</h3>
                <p className="text-sm text-gray-500 mb-4">Value by trade category</p>
                <div className="w-full" style={{ height: '400px', overflow: 'hidden' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                      <Pie
                        data={categories}
                        dataKey="Value"
                        nameKey="category"
                        cx="40%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        label={false}
                      >
                        {categories && Array.isArray(categories) && categories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name, props) => {
                          const categoryName = props.payload.category || name;
                          return [
                            formatValue(value, currency),
                            categoryName
                          ];
                        }}
                        contentStyle={{ 
                          background: 'rgba(255, 255, 255, 0.95)', 
                          borderRadius: '8px', 
                          border: '1px solid #e5e7eb',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Legend 
                        layout="vertical" 
                        align="right"
                        verticalAlign="middle"
                        formatter={(value) => value.length > 18 ? `${value.substring(0, 18)}...` : value}
                        wrapperStyle={{ fontSize: '11px', paddingLeft: '10px' }}
                        iconSize={10}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Commodities Distribution</h3>
                <p className="text-sm text-gray-500 mb-4">Value by commodity in {selectedCategory}</p>
                {commoditiesChartData && commoditiesChartData.length > 0 ? (
                  <div className="w-full" style={{ height: '400px', overflow: 'hidden' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                        <Pie
                          data={commoditiesChartData}
                          dataKey="value"
                          nameKey="name"
                          cx="40%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={3}
                          label={false}
                        >
                          {commoditiesChartData.map((entry, index) => (
                            <Cell key={`commodity-cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name, props) => {
                            return [
                              formatValue(value, currency),
                              props.payload.name
                            ];
                          }}
                          contentStyle={{ 
                            background: 'rgba(255, 255, 255, 0.95)', 
                            borderRadius: '8px', 
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Legend 
                          layout="vertical" 
                          align="right"
                          verticalAlign="middle"
                          formatter={(value) => value.length > 18 ? `${value.substring(0, 18)}...` : value}
                          wrapperStyle={{ fontSize: '10px', paddingLeft: '10px' }}
                          iconSize={10}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[400px]">
                    <div className="text-center">
                      <p className="text-gray-500">No commodities data available for {selectedCategory}</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Category Comparison Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Category Performance</h3>
          <p className="text-sm text-gray-500 mb-4">Imports and Exports by category</p>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={categories.slice(0, 6)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="category" 
                tick={{ fontSize: 11, fill: '#6b7280' }}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#6b7280' }}
                tickFormatter={(value) => formatValue(value, currency)}
              />
              <Tooltip content={<CustomTooltip currency={currency} />} />
              <Legend />
              <Bar dataKey="Imports" fill="#ef4444" name="Imports" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Exports" fill="#10b981" name="Exports" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Focused View */}
        {selectedCategory !== 'all' && (() => {
          // Only show if we have data loaded
          if (!monthlyData?.length || !categoryData?.length) {
            return null;
          }

          try {
            const categoryMonthlyData = getDataByCategory(selectedCategory);
            const commodities = getCommoditiesByCategory(selectedCategory);
            const selectedCatInfo = categoryData.find(cat => cat.category === selectedCategory);
            
            return (
              <>
                {/* Category Summary Banner */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 rounded-2xl shadow-lg text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-3xl font-bold mb-2">{selectedCategory} Category</h2>
                      <p className="text-green-100">Detailed analysis and commodity breakdown</p>
                    </div>
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium"
                    >
                      View All Categories
                    </button>
                  </div>
                  {selectedCatInfo && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                        <p className="text-xs text-green-100 mb-1">Total Value</p>
                        <p className="text-xl font-bold">{formatValue(currency === 'USD' ? selectedCatInfo.totalUSD : selectedCatInfo.total, currency)}</p>
                      </div>
                      <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                        <p className="text-xs text-green-100 mb-1">Exports</p>
                        <p className="text-xl font-bold">{formatValue(currency === 'USD' ? selectedCatInfo.exportsUSD : selectedCatInfo.exports, currency)}</p>
                      </div>
                      <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                        <p className="text-xs text-green-100 mb-1">Imports</p>
                        <p className="text-xl font-bold">{formatValue(currency === 'USD' ? selectedCatInfo.importsUSD : selectedCatInfo.imports, currency)}</p>
                      </div>
                      <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                        <p className="text-xs text-green-100 mb-1">Balance</p>
                        <p className={`text-xl font-bold ${(selectedCatInfo.balance || 0) >= 0 ? 'text-green-200' : 'text-red-200'}`}>
                          {formatValue(currency === 'USD' ? selectedCatInfo.balanceUSD : selectedCatInfo.balance, currency)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Commodities Breakdown */}
                {commodities && commodities.length > 0 && (
                  <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Commodities in {selectedCategory}</h3>
                    <p className="text-sm text-gray-500 mb-6">Detailed breakdown by commodity</p>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                              Commodity
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                              Unit
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                              Quantity
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                              Imports
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                              Exports
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                              Balance
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                              Total Value
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {commodities.map((item, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                {item.commodity}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {item.unit}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700">
                                {formatVolume(item.quantity)}
                              </td>
                              <td className="px-6 py-4 text-sm text-red-600 font-medium">
                                {formatValue(currency === 'USD' ? item.importsUSD : item.imports, currency)}
                              </td>
                              <td className="px-6 py-4 text-sm text-green-600 font-medium">
                                {formatValue(currency === 'USD' ? item.exportsUSD : item.exports, currency)}
                              </td>
                              <td className={`px-6 py-4 text-sm font-semibold ${
                                (item.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {formatValue(currency === 'USD' ? item.balanceUSD : item.balance, currency)}
                              </td>
                              <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                {formatValue(currency === 'USD' ? item.totalUSD : item.total, currency)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Monthly Breakdown */}
                {categoryMonthlyData && categoryMonthlyData.length > 0 && (
                  <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {selectedCategory} - Monthly Breakdown
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">Monthly trade data timeline</p>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-green-50 to-green-100">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                              Month
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                              Imports
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                              Exports
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                              Balance
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {categoryMonthlyData.map((row, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {row.month}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                                {formatValue(currency === 'USD' ? (row.importsUSD || 0) : (row.imports || 0), currency)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                                {formatValue(currency === 'USD' ? (row.exportsUSD || 0) : (row.exports || 0), currency)}
                              </td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                                (row.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {formatValue(currency === 'USD' ? (row.balanceUSD || 0) : (row.balance || 0), currency)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                {formatValue(currency === 'USD' ? (row.totalUSD || 0) : (row.total || 0), currency)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            );
          } catch (err) {
            console.error('Error loading category data:', err);
            return null;
          }
        })()}
      </div>
    </div>
  );
};

export default Dashboard;
