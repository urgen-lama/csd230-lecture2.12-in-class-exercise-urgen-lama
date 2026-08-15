import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router';
import { useAuth } from './provider/AuthProvider';
import api from './api/axiosConfig';
import Navbar from './Navbar';
import Home from './Home';
import Book from './Book';
import BookForm from './BookForm';
import InstrumentList from './InstrumentList';   // LAB 5
import InstrumentForm from './InstrumentForm';   // LAB 5
import { ProtectedRoute } from './routes/ProtectedRoute';
import './App.css';

function App() {
    const { token, setToken, isAdmin, logout } = useAuth();
    const navigate = useNavigate();

    // S26 EXPIRATION DETECTION
    const location = useLocation();
    const isExpired = new URLSearchParams(location.search).get("expired");

    const [books, setBooks] = useState([]);
    const [instruments, setInstruments] = useState([]);   // LAB 5
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState('admin');
    const [password, setPassword] = useState('admin');

    // THE HANDSHAKE (Login)
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/auth/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            if (response.ok) {
                const data = await response.json();
                setToken(data.token);
                // CLEANUP: Remove the ?expired=true from the URL on login
                navigate("/", { replace: true });
                alert("Handshake Successful!");
            } else {
                alert("Login Failed. Check credentials.");
            }
        } catch (err) {
            console.error("Login Error:", err);
        }
    };

    // READ DATA - fetch only what the current route actually needs
    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }

        if (location.pathname === '/inventory') {
            setLoading(true);
            api.get('/rest/books')
                .then(res => {
                    setBooks(res.data);
                    setLoading(false);
                })
                .catch((err) => {
                    console.error("Network Fetch Error:", err);
                    setLoading(false);
                });
        } else if (location.pathname === '/niche') {
            // LAB 5: polymorphic fetch - returns Guitars AND Pianos in one list
            setLoading(true);
            api.get('/rest/instruments')
                .then(res => {
                    setInstruments(res.data);
                    setLoading(false);
                })
                .catch((err) => {
                    console.error("Instrument Fetch Error:", err);
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [token, location.pathname]);

    // CRUD HELPERS - BOOKS
    const handleAddBook = (newBook) => setBooks([...books, newBook]);

    const handleDeleteBook = (id) => {
        api.delete(`/rest/books/${id}`)
            .then(() => setBooks(books.filter(b => b.id !== id)));
    };

    const handleUpdateBook = (id, data) => {
        api.put(`/rest/books/${id}`, data)
            .then(res => setBooks(books.map(b => (b.id === id ? res.data : b))));
    };

    // CRUD HELPERS - INSTRUMENTS (LAB 5)
    const handleAddInstrument = (newInstrument) => setInstruments([...instruments, newInstrument]);

    const handleDeleteInstrument = (id) => {
        if (!window.confirm("Delete this instrument? This cannot be undone.")) return;
        api.delete(`/rest/instruments/${id}`)
            .then(() => setInstruments(instruments.filter(i => i.id !== id)))
            .catch(err => {
                console.error("Delete Error:", err);
                alert("Failed to delete. Admin rights are required.");
            });
    };

    const handleUpdateInstrument = (id, data) => {
        api.put(`/rest/instruments/${id}`, data)
            .then(res => setInstruments(instruments.map(i => (i.id === id ? res.data : i))))
            .catch(err => {
                console.error("Update Error:", err);
                alert("Failed to update. Admin rights are required.");
            });
    };

    // --- RENDER LOGIC ---
    if (loading) return <h2>Connecting to RSA Server...</h2>;

    // UI: Login Page (Shown if no active session is found)
    if (!token) {
        return (
            <div className="login-container" style={{ textAlign: 'center', marginTop: '50px' }}>
                <h1>DigitalReads Login (S26 RSA)</h1>

                <form onSubmit={handleLogin} style={{ display: 'inline-block', textAlign: 'left' }}>
                    <div style={{ marginBottom: '10px' }}>
                        <label>Username:</label><br/>
                        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label>Password:</label><br/>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <button type="submit" style={{ width: '100%', padding: '10px' }}>Get RSA Token</button>
                </form>

                {isExpired && (
                    <div style={{ marginTop: '30px' }}>
                        <div style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '15px', borderRadius: '5px', border: '1px solid #ffeeba', fontWeight: 'bold', display: 'inline-block' }}>
                            ⚠️ Security Alert: Your session has expired. Please log in again.
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // UI: Authenticated SPA Navigation Tree
    return (
        <div className="app-container" style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
            <Navbar username={username} onLogout={logout} />

            <Routes>
                <Route path="/" element={<Home />} />

                <Route element={<ProtectedRoute />}>
                    <Route path="/inventory" element={
                        <div className="book-list">
                            <h1>Inventory Management</h1>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {books.map((b) => (
                                    <Book key={b.id} {...b} onDelete={handleDeleteBook} onUpdate={handleUpdateBook} />
                                ))}
                            </div>
                        </div>
                    } />

                    <Route path="/add" element={<BookForm onBookAdded={handleAddBook} />} />

                    {/* LAB 5: NICHE ROUTES - both inside ProtectedRoute */}
                    <Route path="/niche" element={
                        <InstrumentList
                            instruments={instruments}
                            onDelete={handleDeleteInstrument}
                            onUpdate={handleUpdateInstrument}
                        />
                    } />

                    <Route path="/niche/add" element={
                        <InstrumentForm onInstrumentAdded={handleAddInstrument} />
                    } />
                </Route>
            </Routes>
        </div>
    );
}

export default App;