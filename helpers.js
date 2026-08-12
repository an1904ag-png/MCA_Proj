export const CATEGORIES = {
  expense: ['Food', 'Rent', 'Transport', 'Utilities', 'Shopping', 'Health', 'Education', 'Other'],
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

export function currentMonthKey() {
  return new Date().toISOString().slice(0, 7);
}

export function expenseByCategory(transactions) {
  const totals = {};
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      totals[t.category] = (totals[t.category] || 0) + Number(t.amount);
    });
  return totals;
}

export function monthlyNet(transactions) {
  const totals = {};
  transactions.forEach((t) => {
    const month = t.date.slice(0, 7);
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

// Groups transactions by month, keeping income and expense totals separate. Used for the grouped bar chart.
export function monthlyIncomeExpense(transactions) {
  const totals = {};
  transactions.forEach((t) => {
    const month = t.date.slice(0, 7);
    if (!totals[month]) totals[month] = { income: 0, expense: 0 };
    totals[month][t.type] += Number(t.amount);
  });
  return Object.keys(totals)
    .sort()
    .reduce((sorted, key) => {
      sorted[key] = totals[key];
      return sorted;
    }, {});
}

// Checks whether a new entry looks like a duplicate of one already logged on the same day.
export function findDuplicate(transactions, { type, amount, category, date }) {
  return transactions.find(
    (t) =>
      t.type === type &&
      Number(t.amount) === Number(amount) &&
      t.category === category &&
      t.date === date
  );
}

// Sums expenses for one category within the current calendar month. Used by the budgets feature.
export function categorySpentThisMonth(transactions, category) {
  const month = currentMonthKey();
  return transactions
    .filter((t) => t.type === 'expense' && t.category === category && t.date.startsWith(month))
    .reduce((sum, t) => sum + Number(t.amount), 0);
}

// All-time net savings (all income minus all expenses). Used by the savings goals feature.
export function totalNetSavings(transactions) {
  return transactions.reduce(
    (sum, t) => sum + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)),
    0
  );
}

// Produces a handful of plain-language observations from the transaction history.
export function generateInsights(transactions) {
  const insights = [];
  if (transactions.length === 0) return insights;

  const byMonth = monthlyNet(transactions);
  const months = Object.keys(byMonth);

  if (months.length >= 2) {
    const last = byMonth[months[months.length - 1]];
    const prev = byMonth[months[months.length - 2]];
    if (prev !== 0) {
      const change = ((last - prev) / Math.abs(prev)) * 100;
      const direction = change >= 0 ? 'increased' : 'decreased';
      insights.push(
        `Your net savings ${direction} ${Math.abs(change).toFixed(0)}% compared to last month.`
      );
    }
  }

  const byCategory = expenseByCategory(transactions);
  const categoryEntries = Object.entries(byCategory);
  if (categoryEntries.length > 0) {
    const totalExpense = categoryEntries.reduce((sum, [, v]) => sum + v, 0);
    const [topCategory, topAmount] = categoryEntries.sort((a, b) => b[1] - a[1])[0];
    const share = totalExpense > 0 ? ((topAmount / totalExpense) * 100).toFixed(0) : 0;
    insights.push(`${topCategory} is your highest expense category, ${share}% of total spending.`);
  }

  if (months.length >= 2) {
    const positiveMonths = months.filter((m) => byMonth[m] > 0).length;
    insights.push(`You had a net positive month in ${positiveMonths} of the last ${months.length} months.`);
  }

  return insights;
}

// Produces simple, rule-based suggestions from income/expense ratios. Not financial advice.
export function generateSuggestions(transactions) {
  const suggestions = [];
  if (transactions.length === 0) return suggestions;

  const income = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const expense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);

  if (income === 0) {
    suggestions.push('Log an income entry to see personalized spending suggestions.');
    return suggestions;
  }

  const ratio = expense / income;
  if (ratio > 0.9) {
    suggestions.push('Your expenses used over 90% of your income. Consider reviewing discretionary categories.');
  } else if (ratio < 0.7) {
    suggestions.push("You're saving over 30% of your income. Consider setting some aside for an emergency fund.");
  } else {
    suggestions.push('Your income and expenses look reasonably balanced this period.');
  }

  return suggestions;
}

// Converts the transaction list into a downloadable CSV file.
export function downloadTransactionsCSV(transactions) {
  const header = ['Date', 'Type', 'Category', 'Amount', 'Note'];
  const rows = transactions.map((t) => [
    t.date,
    t.type,
    t.category,
    t.amount,
    (t.note || '').replace(/,/g, ';'),
  ]);
  const csvContent = [header, ...rows].map((row) => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ledger-transactions-${currentMonthKey()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
