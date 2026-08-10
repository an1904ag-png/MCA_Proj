import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './AuthContext';
import { CATEGORIES } from './helpers';

const today = () => new Date().toISOString().slice(0, 10);

export default function TransactionForm() {
  const { user } = useAuth();
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES.expense[0]);
  const [date, setDate] = useState(today());
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  function handleTypeChange(newType) {
    setType(newType);
    setCategory(CATEGORIES[newType][0]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

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
      // Reset the form but keep the date, since people often log several entries for the same day.
      setAmount('');
      setNote('');
    } catch (err) {
      console.error('Failed to save transaction', err);
      alert('Could not save that entry. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
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
