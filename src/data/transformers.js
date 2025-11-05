// Data transformation utilities
export function transformCsvRow(row) {
  // Parse and validate month format
  const month = row.Month.trim();
  if (!month.match(/^\d{4}-\d{2}$/)) {
    throw new Error(`Invalid month format: ${month}`);
  }

  // Parse numeric values with fallbacks
  const quantity = Number(row.Quantity_2025) || Number(row.Quantity_2024) || 0;
  const valuePKR = Number(row.Rupees_2025) || Number(row.Rupees_2024) || 0;
  const valueUSD = Number(row.Dollar_2025) || Number(row.Dollar_2024) || 0;

  // Validate required fields
  if (!row.Group || !row.Commodity || !row.Unit) {
    throw new Error('Missing required fields in CSV row');
  }

  return {
    month,
    group: row.Group.trim(),
    commodity: row.Commodity.trim(),
    unit: row.Unit.trim(),
    quantity,
    valuePKR,
    valueUSD
  };
}

export function normalizeTradeGroup(group) {
  if (!group) return 'Other';
  
  const groupMap = {
    'Food Group': 'Food',
    'Textile Group': 'Textile',
    'Petroleum Group': 'Petroleum',
    'Machinery Group': 'Machinery',
    'Transport Group': 'Machinery',
    'Metal Group': 'Manufacturing',
    'Chemical Group': 'Chemicals',
    'Miscellaneous Group': 'Manufacturing'
  };

  // Clean up the group name
  const cleanGroup = group.trim();
  return groupMap[cleanGroup] || 'Manufacturing';
}

export function validateTradeData(data) {
  if (!Array.isArray(data)) {
    throw new Error('Trade data must be an array');
  }
  
  // Check required fields
  const requiredFields = ['month', 'group', 'commodity', 'unit', 'quantity', 'valuePKR', 'valueUSD'];
  const missingFields = data.some(row => 
    requiredFields.some(field => !(field in row))
  );
  
  if (missingFields) {
    throw new Error('Trade data missing required fields');
  }
  
  return data;
}