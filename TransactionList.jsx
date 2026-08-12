import { useState, useMemo } from 'react';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { formatMoney, formatDate, downloadTransactionsCSV, CATEGORIES } from './helpers';

export default function TransactionList({ transactions, onRepeat }) {
  const [deletingId, setDeletingId] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const allCategories = useMemo(
    () => ['All', ...new Set([...CATEGORIES.expense, ...CATEGORIES.income])],
    []
  );

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (categoryFilter !== 'All' && t.category !== categoryFilter) return false;
      if (startDate && t.date < startDate) return false;
      if (endDate && t.date > endDate) return false;
      return true;
    });
  }, [transactions, categoryFilter, startDate, endDate]);

  async function handleDelete(id) {
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, 'transactions', id));
    } catch (err) {
      console.error('Failed to delete transaction', err);
      alert('Could not delete that entry. Try again.');
    } finally {
      setDeletingId(null);
    }
  }

  function clearFilters() {
    setCategoryFilter('All');
    setStartDate('');
    setEndDate('');
  }

  return (
    <div>
      <div className="filter-bar">
        <label>
          Category
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            {allCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label>
          From
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </label>
        <label>
          To
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </label>
        {(categoryFilter !== 'All' || startDate || endDate) && (
          <button type="button" className="btn-link" onClick={clearFilters}>
            Clear filters
          </button>
        )}
        <button
          type="button"
          className="btn-secondary"
          onClick={() => downloadTransactionsCSV(filtered)}
          disabled={filtered.length === 0}
        >
          Export CSV
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="empty-state">
          {transactions.length === 0 ? 'No entries yet. Add your first transaction above.' : 'No entries match these filters.'}
        </p>
      ) : (
        <div className="ledger-table">
          <div className="ledger-row ledger-head">
            <span>Date</span>
            <span>Category</span>
            <span>Note</span>
            <span className="align-right">Amount</span>
            <span></span>
            <span></span>
          </div>
          {filtered.map((t) => (
            <div className="ledger-row" key={t.id}>
              <span>{formatDate(t.date)}</span>
              <span>{t.category}</span>
              <span className="tx-note-cell">{t.note || '—'}</span>
              <span className={`align-right amount ${t.type}`}>
                {t.type === 'income' ? '+' : '−'}
                {formatMoney(t.amount)}
              </span>
              <button
                className="btn-repeat"
                onClick={() => onRepeat(t)}
                aria-label="Repeat this entry with today's date"
                title="Repeat with today's date"
              >
                ↻
              </button>
              <button
                className="btn-delete"
                onClick={() => handleDelete(t.id)}
                disabled={deletingId === t.id}
                aria-label="Delete entry"
              >
                {deletingId === t.id ? '…' : '✕'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
