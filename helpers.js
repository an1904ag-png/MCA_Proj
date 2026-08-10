export const CATEGORIES = {
  expense: ['Tithe', 'Food', 'Rent', 'Transport', 'Utilities', 'Shopping', 'Health', 'Education', 'Other'],
  income: ['Salary', 'Freelance', 'Gift', 'Interest', 'Other'],
};

export function formatMoney(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// Groups transactions by category, summing only expenses. Used for the pie chart.
export function expenseByCategory(transactions) {
  const totals = {};
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      totals[t.category] = (totals[t.category] || 0) + Number(t.amount);
    });
  return totals;
}

// Groups transactions by month (YYYY-MM) and nets income minus expense. Used for the trend chart.
export function monthlyNet(transactions) {
  const totals = {};
  transactions.forEach((t) => {
    const month = t.date.slice(0, 7); // "2026-07"
    const signedAmount = t.type === 'income' ? Number(t.amount) : -Number(t.amount);
    totals[month] = (totals[month] || 0) + signedAmount;
  });
  return Object.keys(totals)
    .sort()
    .reduce((sorted, key) => {
      sorted[key] = totals[key];
      return sorted;
    }, {});
}
