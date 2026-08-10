import { formatMoney } from './helpers';

export default function Dashboard({ transactions }) {
  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const expense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = income - expense;

  return (
    <div className="summary-row">
      <div className="summary-card">
        <span className="summary-label">Balance</span>
        <span className={`summary-value ${balance >= 0 ? 'income' : 'expense'}`}>
          {formatMoney(balance)}
        </span>
      </div>
      <div className="summary-card">
        <span className="summary-label">Total income</span>
        <span className="summary-value income">{formatMoney(income)}</span>
      </div>
      <div className="summary-card">
        <span className="summary-label">Total expenses</span>
        <span className="summary-value expense">{formatMoney(expense)}</span>
      </div>
    </div>
  );
}
