import { useAuth } from './AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <span className="ledger-title small">Ledger</span>
      <div className="navbar-right">
        <span className="navbar-email">{user?.email}</span>
        <button className="btn-link" onClick={logout}>
          Log out
        </button>
      </div>
    </nav>
  );
}
