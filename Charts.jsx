import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import { expenseByCategory, incomeByCategory, monthlyIncomeExpense, formatMoney } from './helpers';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const EXPENSE_PALETTE = ['#B33A3A', '#C97B3A', '#C9A227', '#8A5FBF', '#4A6FA5', '#5C8A8A', '#8A8A4A', '#B36A9E'];
const INCOME_PALETTE = ['#3A7D5C', '#5C8A6A', '#7BAE8F', '#C9A227', '#4A6FA5', '#8A5FBF'];

function CategoryPie({ title, labels, values, palette, emptyText }) {
  return (
    <div className="chart-card">
      <h3>{title}</h3>
      {labels.length > 0 ? (
        <Pie
          data={{
            labels,
            datasets: [
              {
                data: values,
                backgroundColor: palette,
                borderColor: '#FAFAF7',
                borderWidth: 2,
              },
            ],
          }}
          options={{
            plugins: {
              legend: { position: 'bottom', labels: { font: { family: 'IBM Plex Sans' } } },
              tooltip: {
                callbacks: {
                  label: (ctx) => `${ctx.label}: ${formatMoney(ctx.raw)}`,
                },
              },
            },
          }}
        />
      ) : (
        <p className="empty-state">{emptyText}</p>
      )}
    </div>
  );
}

export default function Charts({ transactions }) {
  const expenseCategories = expenseByCategory(transactions);
  const incomeCategories = incomeByCategory(transactions);

  const byMonth = monthlyIncomeExpense(transactions);
  const monthLabels = Object.keys(byMonth);
  const incomeValues = monthLabels.map((m) => byMonth[m].income);
  const expenseValues = monthLabels.map((m) => byMonth[m].expense);

  if (transactions.length === 0) {
    return null;
  }

  return (
    <div className="charts-grid">
      <CategoryPie
        title="Expenses by category"
        labels={Object.keys(expenseCategories)}
        values={Object.values(expenseCategories)}
        palette={EXPENSE_PALETTE}
        emptyText="No expenses logged yet."
      />

      <CategoryPie
        title="Income by category"
        labels={Object.keys(incomeCategories)}
        values={Object.values(incomeCategories)}
        palette={INCOME_PALETTE}
        emptyText="No income logged yet."
      />

      <div className="chart-card">
        <h3>Income vs. expenses by month</h3>
        <Bar
          data={{
            labels: monthLabels,
            datasets: [
              { label: 'Income', data: incomeValues, backgroundColor: '#3A7D5C', borderRadius: 2 },
              { label: 'Expense', data: expenseValues, backgroundColor: '#B33A3A', borderRadius: 2 },
            ],
          }}
          options={{
            plugins: {
              legend: { position: 'bottom', labels: { font: { family: 'IBM Plex Sans' } } },
              tooltip: {
                callbacks: {
                  label: (ctx) => `${ctx.dataset.label}: ${formatMoney(ctx.raw)}`,
                },
              },
            },
            scales: {
              y: {
                ticks: { callback: (val) => formatMoney(val) },
              },
            },
          }}
        />
      </div>
    </div>
  );
}
