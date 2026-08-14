import { useEffect, useState } from 'react';

/**
 * A single magazine row. Mirrors Book.jsx exactly:
 * local "edit mode" state, inline inputs, Save / Cancel / Edit / Delete.
 */
function Magazine({ id, title, price, copies, orderQty, currentIssue, onDelete, onUpdate }) {
    const [isEditing, setIsEditing] = useState(false);
    const [tempTitle, setTempTitle] = useState(title);
    const [tempPrice, setTempPrice] = useState(price);
    const [tempOrderQty, setTempOrderQty] = useState(orderQty);

    const handleSave = () => {
        const updatedMagazine = {
            title: tempTitle,
            price: parseFloat(tempPrice),
            copies: copies ?? 10,
            orderQty: parseInt(tempOrderQty, 10),
            currentIssue: currentIssue // preserve the existing issue date
        };
        onUpdate(id, updatedMagazine); // Call parent function
        setIsEditing(false);           // Exit edit mode
    };

    if (isEditing) {
        return (
            <div className="book-row editing" style={{ border: '2px solid orange', margin: '10px 0', padding: '15px', borderRadius: '8px', display: 'flex', gap: '10px', backgroundColor: '#fffdf5' }}>
                <input style={{ flex: 2, padding: '5px' }} type="text" value={tempTitle} onChange={(e) => setTempTitle(e.target.value)} />
                <input style={{ width: '80px', padding: '5px' }} type="number" step="0.01" value={tempPrice} onChange={(e) => setTempPrice(e.target.value)} />
                <input style={{ width: '80px', padding: '5px' }} type="number" value={tempOrderQty} onChange={(e) => setTempOrderQty(e.target.value)} />

                <button onClick={handleSave} style={{ backgroundColor: '#28a745', color: 'white', cursor: 'pointer' }}>Save</button>
                <button onClick={() => setIsEditing(false)} style={{ cursor: 'pointer' }}>Cancel</button>
            </div>
        );
    }

    return (
        <div className="book-row" style={{ border: '1px solid #ccc', margin: '10px 0', padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9f9f9' }}>
            <div className="book-info">
                <h3>{title}</h3>
                <p>
                    <strong>Price:</strong> ${Number(price).toFixed(2)} |{' '}
                    <strong>Order Qty:</strong> {orderQty} |{' '}
                    <strong>Issue:</strong> {currentIssue ? String(currentIssue).substring(0, 10) : 'n/a'}
                </p>
            </div>
            <div className="book-actions">
                <button onClick={() => setIsEditing(true)} style={{ backgroundColor: '#ffc107', marginRight: '5px', cursor: 'pointer' }}>Edit</button>
                <button onClick={() => onDelete(id)} style={{ backgroundColor: '#ff4444', color: 'white', cursor: 'pointer' }}>Delete</button>
            </div>
        </div>
    );
}

/**
 * MagazineList owns the magazine collection and every network call.
 * The RSA token arrives as a prop from App.jsx state - exactly the same
 * token the book list uses. Every fetch below sends it as a Bearer header.
 */
function MagazineList({ token }) {
    const [magazines, setMagazines] = useState([]);
    const [loading, setLoading] = useState(true);

    // Add-form state
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState(0.0);
    const [orderQty, setOrderQty] = useState(0);

    // READ (Authenticated)
    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }
        setLoading(true);
        fetch('/api/rest/magazines', {
            headers: { 'Authorization': `Bearer ${token}` } // THE RSA PASSPORT
        })
            .then(res => {
                if (!res.ok) throw new Error("Unauthorized");
                return res.json();
            })
            .then(data => {
                setMagazines(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Magazine Fetch Error:", err);
                setLoading(false);
            });
    }, [token]);

    // CREATE (Authenticated)
    const handleAddMagazine = (e) => {
        e.preventDefault();
        const newMagazine = {
            title,
            price: parseFloat(price),
            copies: 10,
            orderQty: parseInt(orderQty, 10),
            currentIssue: new Date().toISOString().substring(0, 19) // LocalDateTime format
        };

        fetch('/api/rest/magazines', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // THE CRITICAL S26 LINE
            },
            body: JSON.stringify(newMagazine)
        })
            .then(res => {
                if (!res.ok) throw new Error("Could not save magazine. Check roles.");
                return res.json();
            })
            .then(saved => {
                alert("Magazine Saved to Database!");
                setMagazines([...magazines, saved]);
                setTitle(''); setPrice(0.0); setOrderQty(0);
            })
            .catch(err => alert(err.message));
    };

    // DELETE (Authenticated)
    const handleDeleteMagazine = (id) => {
        if (!window.confirm("Delete this magazine? This cannot be undone.")) return;
        fetch(`/api/rest/magazines/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` } // THE PASSPORT
        })
            .then(res => {
                if (res.ok) {
                    setMagazines(magazines.filter(m => m.id !== id));
                } else {
                    alert("Failed to delete. You might not have ADMIN rights.");
                }
            })
            .catch(err => console.error("Delete Error:", err));
    };

    // UPDATE (Authenticated)
    const handleUpdateMagazine = (id, data) => {
        fetch(`/api/rest/magazines/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // THE PASSPORT
            },
            body: JSON.stringify(data)
        })
            .then(res => {
                if (!res.ok) throw new Error("Update failed.");
                return res.json();
            })
            .then(saved => setMagazines(magazines.map(m => (m.id === id ? saved : m))))
            .catch(err => alert(err.message));
    };

    if (loading) return <h2>Loading Magazines...</h2>;

    return (
        <div className="magazine-list" style={{ display: 'flex', flexDirection: 'column' }}>
            <h1>Magazine Management</h1>

            <form onSubmit={handleAddMagazine} style={{ border: '2px solid blue', padding: '20px', marginBottom: '20px' }}>
                <h3>Add New Magazine (Secured)</h3>
                <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                <input type="number" step="0.01" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} required />
                <input type="number" placeholder="Order Qty" value={orderQty} onChange={(e) => setOrderQty(e.target.value)} required />
                <button type="submit">Save to RSA Backend</button>
            </form>

            {magazines.length === 0 && <p>No magazines in the database yet.</p>}

            {magazines.map((m) => (
                <Magazine
                    key={m.id}
                    {...m}
                    onDelete={handleDeleteMagazine}
                    onUpdate={handleUpdateMagazine}
                />
            ))}
        </div>
    );
}


export default MagazineList;