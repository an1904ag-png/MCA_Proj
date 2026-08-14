import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './AuthContext';
import { formatMoney, totalNetSavings } from './helpers';

export default function Goals({ transactions }) {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'goals'), where('uid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setGoals(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsubscribe;
  }, [user]);

  const netSavings = totalNetSavings(transactions);

  async function handleAddGoal(e) {
    e.preventDefault();
    if (!name.trim() || !targetAmount || Number(targetAmount) <= 0) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'goals'), {
        uid: user.uid,
        name: name.trim(),
        targetAmount: Number(targetAmount),
      });
      setName('');
      setTargetAmount('');
    } catch (err) {
      console.error('Failed to save goal', err);
      alert('Could not save that goal. Try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveGoal(id) {
    try {
      await deleteDoc(doc(db, 'goals', id));
    } catch (err) {
      console.error('Failed to remove goal', err);
    }
  }

  return (
    <section className="card">
      <h2>Savings goals</h2>
      <form onSubmit={handleAddGoal} className="budget-form">
        <input
          type="text"
          placeholder="Goal name, e.g. New Laptop"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
        />
        <input
          type="number"
          min="1"
          placeholder="Target amount (₹)"
          value={targetAmount}
          onChange={(e) => setTargetAmount(e.target.value)}
        />
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Add goal'}
        </button>
      </form>

      {goals.length === 0 ? (
        <p className="empty-state">No savings goals yet. Add one above to track your progress.</p>
      ) : (
        <div className="budget-list">
          {goals.map((g) => {
            const progress = Math.max(0, Math.min((netSavings / g.targetAmount) * 100, 100));
            return (
              <div className="budget-row" key={g.id}>
                <div className="budget-row-header">
                  <span>{g.name}</span>
                  <span>
                    {formatMoney(Math.max(netSavings, 0))} / {formatMoney(g.targetAmount)}
                  </span>
                  <button className="btn-delete" onClick={() => handleRemoveGoal(g.id)} aria-label="Remove goal">
                    ✕
                  </button>
                </div>
                <div className="budget-bar-track">
                  <div className="budget-bar-fill ok" style={{ width: `${progress}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
      <p className="insights-disclaimer">
        Progress is based on your all-time net savings (total income minus total expenses).
      </p>
    </section>
  );
}
