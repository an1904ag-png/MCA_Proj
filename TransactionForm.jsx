import { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './AuthContext';
import { CATEGORIES, findDuplicate } from './helpers';

const today = () => new Date().toISOString().slice(0, 10);

// `transactions` is passed down so we can check for likely duplicates before saving.
// `prefill` (optional) lets the "Repeat" action in the ledger table populate this form.
export default function TransactionForm({ transactions, prefill, onPrefillConsumed }) {
  const { user } = useAuth();
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES.expense[0]);
  const [date, setDate] = useState(today());
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (prefill) {
      setType(prefill.type);
      setAmount(String(prefill.amount));
      setCategory(prefill.category);
      setDate(today());
      setNote(prefill.note || '');
      if (onPrefillConsumed) onPrefillConsumed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefill]);

  function handleTypeChange(newType) {
    setType(newType);
    setCategory(CATEGORIES[newType][0]);
  }

  async function saveTransaction() {
    setSaving(true);
    try {
      await addDoc(collection(db, 'transactions'), {
        uid: user.uid,
        type,
        amount: Number(amount),
        category,
        date,
        note: note.trim(),
        createdAt: serverTimestamp(),
      });
      setAmount('');
      setNote('');
    } catch (err) {
      console.error('Failed to save transaction', err);
      alert('Could not save that entry. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    const duplicate = findDuplicate(transactions || [], { type, amount, category, date });
    if (duplicate) {
      const confirmed = window.confirm(
        `You already logged ₹${duplicate.amount} for ${duplicate.category} on this date. Add this entry anyway?`
      );
      if (!confirmed) return;
    }

    saveTransaction();
  }

  return (
    <form onSubmit={handleSubmit} className="tx-form">
      <div className="tx-type-toggle">
        <button
          type="button"
          className={type === 'expense' ? 'toggle-btn active expense' : 'toggle-btn'}
          onClick={() => handleTypeChange('expense')}
        >
          Expense
        </button>
        <button
          type="button"
          className={type === 'income' ? 'toggle-btn active income' : 'toggle-btn'}
          onClick={() => handleTypeChange('income')}
        >
          Income
        </button>
      </div>

      <div className="tx-form-grid">
        <label>
          Amount (₹)
          <input
            type="number"
            min="1"
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            placeholder="0"
          />
        </label>

        <label>
          Category
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES[type].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label>
          Date
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </label>

        <label className="tx-note">
          Note (optional)
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Groceries at DMart"
            maxLength={80}
          />
        </label>
      </div>

      <button type="submit" className="btn-primary" disabled={saving}>
        {saving ? 'Saving…' : 'Add entry'}
      </button>
    </form>
  );
}
