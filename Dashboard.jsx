import { formatMoney, generateInsights, generateSuggestions } from './helpers';

export default function Dashboard({ transactions }) {
  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const expense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = income - expense;
  const insights = generateInsights(transactions);
  const suggestions = generateSuggestions(transactions);

  return (
    <>
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

      {(insights.length > 0 || suggestions.length > 0) && (
        <div className="insights-card">
          {insights.length > 0 && (
            <div className="insights-block">
              <h3>Insights</h3>
              <ul>
                {insights.map((text, i) => (
                  <li key={i}>{text}</li>
                ))}
              </ul>
            </div>
          )}
          {suggestions.length > 0 && (
            <div className="insights-block">
              <h3>Suggestions</h3>
              <ul>
                {suggestions.map((text, i) => (
                  <li key={i}>{text}</li>
                ))}
              </ul>
              <p className="insights-disclaimer">
                Rule-based observations from your own data, not financial advice.
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
