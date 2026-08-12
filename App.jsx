import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './AuthContext';
import Login from './Login';
import Navbar from './Navbar';
import Dashboard from './Dashboard';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';
import Charts from './Charts';
import Budgets from './Budgets';
import Goals from './Goals';

export default function App() {
  const { user, loading } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [prefill, setPrefill] = useState(null);

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      return;
    }

    const q = query(
      collection(db, 'transactions'),
      where('uid', '==', user.uid),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const rows = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setTransactions(rows);
        setLoadError(null);
      },
      (err) => {
        // Most commonly caused by a missing Firestore composite index for this
        // where + orderBy combination. Firebase's own error message includes a
        // direct link to create it, check the browser console for that link.
        console.error('Failed to load transactions', err);
        setLoadError(
          'Could not load your transactions. Open the browser console for details, this often means a Firestore index needs to be created.'
        );
      }
    );

    return unsubscribe;
  }, [user]);

  function handleRepeat(transaction) {
    setPrefill({
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category,
      note: transaction.note,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (loading) {
    return <div className="loading-screen">Loading…</div>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        {loadError && <p className="load-error">{loadError}</p>}
        <Dashboard transactions={transactions} />
        <section className="card">
          <h2>Add a transaction</h2>
          <TransactionForm
            transactions={transactions}
            prefill={prefill}
            onPrefillConsumed={() => setPrefill(null)}
          />
        </section>
        <Charts transactions={transactions} />
        <Budgets transactions={transactions} />
        <Goals transactions={transactions} />
        <section className="card">
          <h2>All entries</h2>
          <TransactionList transactions={transactions} onRepeat={handleRepeat} />
        </section>
      </main>
    </div>
  );
}
