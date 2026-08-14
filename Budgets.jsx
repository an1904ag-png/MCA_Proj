import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './AuthContext';
import { CATEGORIES, formatMoney, categorySpentThisMonth } from './helpers';

export default function Budgets({ transactions }) {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [category, setCategory] = useState(CATEGORIES.expense[0]);
  const [limit, setLimit] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'budgets'), where('uid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBudgets(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsubscribe;
  }, [user]);

  async function handleSetBudget(e) {
    e.preventDefault();
    if (!limit || Number(limit) <= 0) return;
    setSaving(true);
    try {
      const budgetId = `${user.uid}_${category}`;
      await setDoc(doc(db, 'budgets', budgetId), {
        uid: user.uid,
        category,
        monthlyLimit: Number(limit),
      });
      setLimit('');
    } catch (err) {
      console.error('Failed to save budget', err);
      alert('Could not save that budget. Try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveBudget(id) {
    try {
      await deleteDoc(doc(db, 'budgets', id));
    } catch (err) {
      console.error('Failed to remove budget', err);
    }
  }

  return (
    <section className="card">
      <h2>Monthly budgets</h2>
      <form onSubmit={handleSetBudget} className="budget-form">
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.expense.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          type="number"
          min="1"
          placeholder="Monthly limit (₹)"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
        />
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Set budget'}
        </button>
      </form>

      {budgets.length === 0 ? (
        <p className="empty-state">No budgets set yet. Add one above to track your spending limits.</p>
      ) : (
        <div className="budget-list">
          {budgets.map((b) => {
            const spent = categorySpentThisMonth(transactions, b.category);
            const percent = Math.min((spent / b.monthlyLimit) * 100, 100);
            const status = percent >= 100 ? 'over' : percent >= 70 ? 'warn' : 'ok';
            return (
              <div className="budget-row" key={b.id}>
                <div className="budget-row-header">
                  <span>{b.category}</span>
                  <span>
                    {formatMoney(spent)} / {formatMoney(b.monthlyLimit)}
                  </span>
                  <button className="btn-delete" onClick={() => handleRemoveBudget(b.id)} aria-label="Remove budget">
                    ✕
                  </button>
                </div>
                <div className="budget-bar-track">
                  <div className={`budget-bar-fill ${status}`} style={{ width: `${percent}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
