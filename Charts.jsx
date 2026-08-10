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
import { expenseByCategory, monthlyNet, formatMoney } from './helpers';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const PALETTE = ['#C9A227', '#3A7D5C', '#B33A3A', '#4A6FA5', '#8A5FBF', '#C97B3A', '#5C8A8A', '#8A8A4A'];

export default function Charts({ transactions }) {
  const byCategory = expenseByCategory(transactions);
  const categoryLabels = Object.keys(byCategory);
  const categoryValues = Object.values(byCategory);

  const netByMonth = monthlyNet(transactions);
  const monthLabels = Object.keys(netByMonth);
  const monthValues = Object.values(netByMonth);

  if (transactions.length === 0) {
    return null;
  }

  return (
    <div className="charts-grid">
      <div className="chart-card">
        <h3>Where your money goes</h3>
        {categoryLabels.length > 0 ? (
          <Pie
            data={{
              labels: categoryLabels,
              datasets: [
                {
                  data: categoryValues,
                  backgroundColor: PALETTE,
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
          <p className="empty-state">No expenses logged yet.</p>
        )}
      </div>

      <div className="chart-card">
        <h3>Monthly net (income minus expenses)</h3>
        <Bar
          data={{
            labels: monthLabels,
            datasets: [
              {
                data: monthValues,
                backgroundColor: monthValues.map((v) => (v >= 0 ? '#3A7D5C' : '#B33A3A')),
                borderRadius: 2,
              },
            ],
          }}
          options={{
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (ctx) => formatMoney(ctx.raw),
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
