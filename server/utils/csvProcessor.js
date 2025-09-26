// CSV processing utilities for bulk allocation upload

// @desc    Parse CSV content to JSON
// @param   {string} csvContent - CSV content as string
// @returns {object} - Parsed data with headers and rows
const parseCSV = (csvContent) => {
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  if (lines.length < 2) {
    throw new Error('CSV must have at least a header row and one data row');
  }
  
  const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(value => value.trim().replace(/"/g, ''));
    
    if (values.length !== headers.length) {
      throw new Error(`Row ${i + 1}: Column count mismatch. Expected ${headers.length}, got ${values.length}`);
    }
    
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });
    
    rows.push(row);
  }
  
  return {
    headers,
    rows,
    totalRows: rows.length
  };
};

// @desc    Validate CSV headers for allocation upload
// @param   {array} headers - CSV headers
// @returns {object} - Validation result
const validateCSVHeaders = (headers) => {
  const requiredHeaders = [
    'department_name',
    'budget_head_name', 
    'allocated_amount',
    'financial_year'
  ];
  
  const optionalHeaders = [
    'remarks'
  ];
  
  const allValidHeaders = [...requiredHeaders, ...optionalHeaders];
  
  const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
  const invalidHeaders = headers.filter(header => !allValidHeaders.includes(header));
  
  return {
    isValid: missingHeaders.length === 0 && invalidHeaders.length === 0,
    missingHeaders,
    invalidHeaders,
    validHeaders: headers.filter(header => allValidHeaders.includes(header))
  };
};

// @desc    Convert CSV row to allocation data
// @param   {object} row - CSV row data
// @param   {array} departments - Available departments
// @param   {array} budgetHeads - Available budget heads
// @returns {object} - Allocation data or error
const convertCSVRowToAllocation = (row, departments, budgetHeads) => {
  const errors = [];
  
  // Find department by name
  const department = departments.find(dept => 
    dept.name.toLowerCase() === row.department_name.toLowerCase()
  );
  
  if (!department) {
    errors.push(`Department "${row.department_name}" not found`);
  }
  
  // Find budget head by name
  const budgetHead = budgetHeads.find(head => 
    head.name.toLowerCase() === row.budget_head_name.toLowerCase()
  );
  
  if (!budgetHead) {
    errors.push(`Budget head "${row.budget_head_name}" not found`);
  }
  
  // Validate allocated amount
  const allocatedAmount = parseFloat(row.allocated_amount);
  if (isNaN(allocatedAmount) || allocatedAmount <= 0) {
    errors.push(`Invalid allocated amount: "${row.allocated_amount}"`);
  }
  
  // Validate financial year format
  const financialYear = row.financial_year.trim();
  if (!financialYear || !financialYear.match(/^\d{4}-\d{2}$/)) {
    errors.push(`Invalid financial year format: "${financialYear}". Expected format: YYYY-YY`);
  }
  
  if (errors.length > 0) {
    return {
      error: errors.join(', ')
    };
  }
  
  return {
    departmentId: department._id,
    departmentName: department.name,
    budgetHeadId: budgetHead._id,
    budgetHeadName: budgetHead.name,
    budgetHeadCode: budgetHead.code,
    allocatedAmount: allocatedAmount,
    financialYear: financialYear,
    remarks: row.remarks || '',
    isValid: true
  };
};

// @desc    Generate CSV template for allocation upload
// @param   {array} departments - Available departments
// @param   {array} budgetHeads - Available budget heads
// @returns {string} - CSV template content
const generateCSVTemplate = (departments, budgetHeads) => {
  const headers = [
    'department_name',
    'budget_head_name',
    'allocated_amount',
    'financial_year',
    'remarks'
  ];
  
  const csvRows = [headers.join(',')];
  
  // Add sample rows
  const sampleRows = [
    [
      departments[0]?.name || 'Computer Science',
      budgetHeads[0]?.name || 'Academic Expenses',
      '500000',
      '2024-25',
      'Sample allocation'
    ],
    [
      departments[1]?.name || 'Electronics and Communication',
      budgetHeads[1]?.name || 'Infrastructure Maintenance',
      '300000',
      '2024-25',
      'Sample allocation'
    ]
  ];
  
  sampleRows.forEach(row => {
    csvRows.push(row.map(field => `"${field}"`).join(','));
  });
  
  return csvRows.join('\n');
};

// @desc    Generate CSV import report
// @param   {array} results - Import results
// @returns {string} - CSV report content
const generateImportReport = (results) => {
  const headers = [
    'row_number',
    'department_name',
    'budget_head_name',
    'allocated_amount',
    'financial_year',
    'status',
    'message'
  ];
  
  const csvRows = [headers.join(',')];
  
  results.forEach((result, index) => {
    const row = [
      index + 1,
      result.departmentName || '',
      result.budgetHeadName || '',
      result.allocatedAmount || '',
      result.financialYear || '',
      result.success ? 'SUCCESS' : 'ERROR',
      result.message || ''
    ];
    
    csvRows.push(row.map(field => `"${field}"`).join(','));
  });
  
  return csvRows.join('\n');
};

module.exports = {
  parseCSV,
  validateCSVHeaders,
  convertCSVRowToAllocation,
  generateCSVTemplate,
  generateImportReport
};
