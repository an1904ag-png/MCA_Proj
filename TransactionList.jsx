import { useState } from 'react';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { formatMoney, formatDate } from './helpers';

export default function TransactionList({ transactions }) {
  const [deletingId, setDeletingId] = useState(null);

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

  if (transactions.length === 0) {
    return <p className="empty-state">No entries yet. Add your first transaction above.</p>;
  }

  return (
    <div className="ledger-table">
      <div className="ledger-row ledger-head">
        <span>Date</span>
        <span>Category</span>
        <span>Note</span>
        <span className="align-right">Amount</span>
        <span></span>
      </div>
      {transactions.map((t) => (
        <div className="ledger-row" key={t.id}>
          <span>{formatDate(t.date)}</span>
          <span>{t.category}</span>
          <span className="tx-note-cell">{t.note || '—'}</span>
          <span className={`align-right amount ${t.type}`}>
            {t.type === 'income' ? '+' : '−'}
            {formatMoney(t.amount)}
          </span>
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
  );
}
