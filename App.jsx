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

export default function App() {
  const { user, loading } = useAuth();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      return;
    }

    // Live query: this fires again automatically whenever data changes,
    // on this device or any other device the user is logged in on.
    const q = query(
      collection(db, 'transactions'),
      where('uid', '==', user.uid),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rows = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTransactions(rows);
    });

    return unsubscribe;
  }, [user]);

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
        <Dashboard transactions={transactions} />
        <section className="card">
          <h2>Add a transaction</h2>
          <TransactionForm />
        </section>
        <Charts transactions={transactions} />
        <section className="card">
          <h2>All entries</h2>
          <TransactionList transactions={transactions} />
        </section>
      </main>
    </div>
  );
}
