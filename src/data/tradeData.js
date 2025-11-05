import Papa from 'papaparse';
import { transformCsvRow, normalizeTradeGroup, validateTradeData } from './transformers';

// Constants
const IMPORTS_PATH = '/data/imports.csv';
const EXPORTS_PATH = '/data/exports.csv';

// Trade Categories for filtering (matches our normalized groups)
export const tradeCategories = [
  'Food',
  'Manufacturing',
  'Textile',
  'Petroleum',
  'Machinery',
  'Chemicals'
];

// Internal state
const state = {
  initialized: false,
  rawRows: [],
  dataByGroup: {},
  availableMonths: [],
  availableGroups: []
};

// Helper function to verify initialization
function checkInitialization() {
  if (!state.initialized) {
    throw new Error('Trade data not initialized. Call initTradeData() first.');
  }
}

// Helper function to check if data is initialized (non-throwing)
export function isDataInitialized() {
  return state.initialized;
}

// CSV parsing helpers
async function fetchText(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.statusText}`);
  return await res.text();
}

async function parseCsvText(text) {
  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: h => (h ? h.trim() : h),
      transform: value => typeof value === 'string' ? value.trim() : value,
      complete: (results) => {
        if (results.errors?.length > 0) {
          console.warn('CSV parsing warnings:', results.errors);
        }
        resolve(results.data.filter(row => 
          row.Month && row.Group && row.Commodity && 
          (Number(row.Quantity_2025) > 0 || Number(row.Quantity_2024) > 0)
        ));
      },
      error: (err) => reject(new Error(`CSV parsing failed: ${err.message}`))
    });
  });
}

// Data access functions
export function getMonthlyAggregates() {
  checkInitialization();

  return state.availableMonths.map(month => {
    const monthlyRows = state.rawRows.filter(row => row.month === month);
    const imports = monthlyRows
      .filter(row => row.type === 'Import')
      .reduce((sum, row) => sum + (row.valuePKR || 0), 0);
    const exports = monthlyRows
      .filter(row => row.type === 'Export')
      .reduce((sum, row) => sum + (row.valuePKR || 0), 0);
    const importsUSD = monthlyRows
      .filter(row => row.type === 'Import')
      .reduce((sum, row) => sum + (row.valueUSD || 0), 0);
    const exportsUSD = monthlyRows
      .filter(row => row.type === 'Export')
      .reduce((sum, row) => sum + (row.valueUSD || 0), 0);
    const quantity = monthlyRows
      .reduce((sum, row) => sum + (row.quantity || 0), 0);

    return {
      month,
      imports,
      exports,
      importsUSD,
      exportsUSD,
      quantity,
      balance: exports - imports,
      balanceUSD: exportsUSD - importsUSD,
      total: imports + exports,
      totalUSD: importsUSD + exportsUSD
    };
  }).sort((a, b) => a.month.localeCompare(b.month));
}

export function getCategoryAggregates() {
  checkInitialization();

  return Object.entries(state.dataByGroup)
    .map(([category, data]) => {
      const imports = data
        .filter(row => row.type === 'Import')
        .reduce((sum, row) => sum + (row.valuePKR || 0), 0);
      const exports = data
        .filter(row => row.type === 'Export')
        .reduce((sum, row) => sum + (row.valuePKR || 0), 0);
      const importsUSD = data
        .filter(row => row.type === 'Import')
        .reduce((sum, row) => sum + (row.valueUSD || 0), 0);
      const exportsUSD = data
        .filter(row => row.type === 'Export')
        .reduce((sum, row) => sum + (row.valueUSD || 0), 0);
      const quantity = data
        .reduce((sum, row) => sum + (row.quantity || 0), 0);

      return {
        category,
        imports,
        exports,
        importsUSD,
        exportsUSD,
        quantity,
        balance: exports - imports,
        balanceUSD: exportsUSD - importsUSD,
        total: imports + exports,
        totalUSD: importsUSD + exportsUSD
      };
    })
    .sort((a, b) => b.total - a.total);
}

export function getTimeSeriesData(category = null) {
  checkInitialization();

  const rows = category
    ? state.dataByGroup[category] || []
    : state.rawRows;

  return state.availableMonths.map(month => {
    const monthlyRows = rows.filter(row => row.month === month);
    const imports = monthlyRows
      .filter(row => row.type === 'Import')
      .reduce((sum, row) => sum + (row.valuePKR || 0), 0);
    const exports = monthlyRows  
      .filter(row => row.type === 'Export')
      .reduce((sum, row) => sum + (row.valuePKR || 0), 0);
    const importsUSD = monthlyRows
      .filter(row => row.type === 'Import')
      .reduce((sum, row) => sum + (row.valueUSD || 0), 0);
    const exportsUSD = monthlyRows  
      .filter(row => row.type === 'Export')
      .reduce((sum, row) => sum + (row.valueUSD || 0), 0);
    const quantity = monthlyRows
      .reduce((sum, row) => sum + (row.quantity || 0), 0);

    return {
      month,
      imports,
      exports,
      importsUSD,
      exportsUSD,
      quantity,
      balance: exports - imports,
      balanceUSD: exportsUSD - importsUSD,
      total: imports + exports,
      totalUSD: importsUSD + exportsUSD
    };
  }).sort((a, b) => a.month.localeCompare(b.month));
}

export function getRawRows() {
  checkInitialization();
  return state.rawRows;
}

export function getAvailableMonths() {
  checkInitialization();
  return state.availableMonths;
}

export function getAvailableGroups() {
  checkInitialization();
  return state.availableGroups;
}

export function getTradeGroups() {
  return getAvailableGroups();
}

// Initialize data from CSV files
export const initTradeData = async () => {
  // Return cached data if available
  if (state.initialized) {
    return {
      groups: state.availableGroups,
      months: state.availableMonths
    };
  }

  try {
    // Load and parse both CSV files
    const [importsText, exportsText] = await Promise.all([
      fetchText(IMPORTS_PATH),
      fetchText(EXPORTS_PATH)
    ]);

    // Parse CSVs
    const [importRows, exportRows] = await Promise.all([
      parseCsvText(importsText),
      parseCsvText(exportsText)
    ]);

    // Transform and validate the data
    const transformedImports = importRows.map(row => ({
      ...transformCsvRow(row),
      type: 'Import'
    }));

    const transformedExports = exportRows.map(row => ({
      ...transformCsvRow(row),
      type: 'Export'
    }));

    // Combine and validate all data
    state.rawRows = validateTradeData([...transformedImports, ...transformedExports]);

    // Extract unique months and groups
    state.availableMonths = [...new Set(state.rawRows.map(row => row.month))].sort();
    const groups = [...new Set(state.rawRows.map(row => normalizeTradeGroup(row.group)))];
    state.availableGroups = groups.filter(group => tradeCategories.includes(group));

    // Group data by category
    state.dataByGroup = state.rawRows.reduce((acc, row) => {
      const normalizedGroup = normalizeTradeGroup(row.group);
      if (!acc[normalizedGroup]) acc[normalizedGroup] = [];
      acc[normalizedGroup].push(row);
      return acc;
    }, {});

    state.initialized = true;

    return {
      groups: state.availableGroups,
      months: state.availableMonths
    };
  } catch (error) {
    console.error('Error initializing trade data:', error);
    throw new Error('Failed to initialize trade data: ' + error.message);
  }
};

/** Returns data for a specific category */
export function getDataByCategory(category) {
  checkInitialization();

  const data = state.dataByGroup[category];
  if (!data) {
    return [];
  }

  return state.availableMonths.map(month => {
    const monthlyRows = data.filter(row => row.month === month);
    const imports = monthlyRows
      .filter(row => row.type === 'Import')
      .reduce((sum, row) => sum + (row.valuePKR || 0), 0);
    const exports = monthlyRows
      .filter(row => row.type === 'Export')
      .reduce((sum, row) => sum + (row.valuePKR || 0), 0);
    const importsUSD = monthlyRows
      .filter(row => row.type === 'Import')
      .reduce((sum, row) => sum + (row.valueUSD || 0), 0);
    const exportsUSD = monthlyRows
      .filter(row => row.type === 'Export')
      .reduce((sum, row) => sum + (row.valueUSD || 0), 0);

    return {
      month,
      imports,
      exports,
      importsUSD,
      exportsUSD,
      balance: exports - imports,
      balanceUSD: exportsUSD - importsUSD,
      total: imports + exports,
      totalUSD: importsUSD + exportsUSD
    };
  }).sort((a, b) => a.month.localeCompare(b.month));
}

/** Returns commodity-level details for a specific category */
export function getCommoditiesByCategory(category) {
  checkInitialization();

  const data = state.dataByGroup[category];
  if (!data || !Array.isArray(data)) {
    return [];
  }

  // Group by commodity
  const commodityMap = {};
  
  data.forEach(row => {
    const commodity = row.commodity || 'Unknown';
    if (!commodityMap[commodity]) {
      commodityMap[commodity] = {
        commodity,
        unit: row.unit || 'N/A',
        imports: 0,
        exports: 0,
        importsUSD: 0,
        exportsUSD: 0,
        quantity: 0,
        importQuantity: 0,
        exportQuantity: 0
      };
    }

    if (row.type === 'Import') {
      commodityMap[commodity].imports += row.valuePKR || 0;
      commodityMap[commodity].importsUSD += row.valueUSD || 0;
      commodityMap[commodity].importQuantity += row.quantity || 0;
    } else if (row.type === 'Export') {
      commodityMap[commodity].exports += row.valuePKR || 0;
      commodityMap[commodity].exportsUSD += row.valueUSD || 0;
      commodityMap[commodity].exportQuantity += row.quantity || 0;
    }
    
    commodityMap[commodity].quantity += row.quantity || 0;
  });

  // Convert to array and calculate totals/balance
  return Object.values(commodityMap)
    .map(item => ({
      ...item,
      balance: item.exports - item.imports,
      balanceUSD: item.exportsUSD - item.importsUSD,
      total: item.imports + item.exports,
      totalUSD: item.importsUSD + item.exportsUSD
    }))
    .sort((a, b) => (b.total || 0) - (a.total || 0));
}

/** Reset state (for development) */
export function resetTradeData() {
  state.initialized = false;
  state.rawRows = [];
  state.dataByGroup = {};
  state.availableMonths = [];
  state.availableGroups = [];
}
