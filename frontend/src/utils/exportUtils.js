/**
 * Utility functions for exporting data
 */

/**
 * Export transactions to CSV
 */
export const exportTransactionsToCSV = (transactions, filename = 'transactions.csv') => {
  if (!transactions || transactions.length === 0) {
    return;
  }

  // CSV headers
  const headers = [
    'Date',
    'Symbol',
    'Name',
    'Type',
    'Coins',
    'Price',
    'Value (USD)',
    'Source',
    'Status',
  ];

  // Convert transactions to CSV rows
  const rows = transactions.map((tx) => {
    const date = tx.date ? new Date(tx.date).toLocaleDateString() : '';
    return [
      date,
      tx.symbol || '',
      tx.name || '',
      tx.type || '',
      tx.coins || 0,
      tx.purchased_price || 0,
      tx.value_usd || 0,
      tx.source || 'manual',
      tx.status || 'active',
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

/**
 * Export portfolio summary to CSV
 */
export const exportPortfolioToCSV = (portfolio, filename = 'portfolio.csv') => {
  if (!portfolio || !portfolio.holdings) {
    return;
  }

  const headers = ['Symbol', 'Coins', 'Cost Basis', 'Current Value', 'Gain/Loss', 'Gain %', 'Current Price'];
  
  const rows = portfolio.holdings.map((holding) => [
    holding.symbol || '',
    holding.coins || 0,
    holding.cost || 0,
    holding.value || 0,
    holding.gain || 0,
    holding.gain_percent || 0,
    holding.price || 0,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

