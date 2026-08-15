import { Link } from 'react-router';
import { useAuth } from './provider/AuthProvider';

function NavBar({ username, onLogout }) {
    const { isAdmin } = useAuth();

    const navStyle = {
        padding: '1rem',
        backgroundColor: '#222',
        color: 'white',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    };

    const linkGroupStyle = {
        display: 'flex',
        gap: '18px',
        flexWrap: 'wrap'
    };

    const linkStyle = {
        color: 'white',
        textDecoration: 'none',
        fontWeight: 'bold',
        fontSize: '1.05rem'
    };

    const logoutButtonStyle = {
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'background 0.3s'
    };

    return (
        <nav style={navStyle}>
            <div style={linkGroupStyle}>
                <Link to="/" style={linkStyle}>🏠 Home</Link>
                <Link to="/inventory" style={linkStyle}>📚 View Inventory</Link>

                {/* Conditional RBAC rendering - books */}
                {isAdmin && (
                    <Link to="/add" style={{ ...linkStyle, color: '#ffc107' }}>
                        ➕ Admin: Add Book
                    </Link>
                )}

                {/* LAB 5: NICHE DEPARTMENT */}
                <Link to="/niche" style={linkStyle}>🎸 Instruments</Link>

                {/* Conditional RBAC rendering - niche */}
                {isAdmin && (
                    <Link to="/niche/add" style={{ ...linkStyle, color: '#ffc107' }}>
                        ➕ Admin: Add Instrument
                    </Link>
                )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
               <span style={{ fontSize: '0.9rem', color: '#ccc' }}>
                   User: <strong style={{ color: 'white' }}>{username}</strong>
               </span>
                <button
                    onClick={onLogout}
                    style={logoutButtonStyle}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
                >
                    Sign Out
                </button>
            </div>
        </nav>
    );
}

export default NavBar;