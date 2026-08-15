import { useEffect, useState } from 'react';
import { useAuth } from './provider/AuthProvider';
import api from './api/axiosConfig';

/**
 * ONE row, rendered polymorphically.
 *
 * Every instrument shares brand / condition / price, but the subclass-specific
 * fields differ: a Guitar has stringCount + isElectric, a Piano has keyCount +
 * isDigital. We branch on productType, which ProductEntity.getProductType()
 * serialises from the runtime class name ("GuitarEntity" / "PianoEntity").
 */
function InstrumentRow({ instrument, onDelete, onUpdate }) {
    const { isAdmin } = useAuth();

    const isGuitar = instrument.productType === 'GuitarEntity';

    const [isEditing, setIsEditing] = useState(false);
    const [tempBrand, setTempBrand] = useState(instrument.brand ?? '');
    const [tempCondition, setTempCondition] = useState(instrument.instrumentCondition ?? '');
    const [tempPrice, setTempPrice] = useState(instrument.price ?? 0);

    // Subclass-specific draft state
    const [tempStringCount, setTempStringCount] = useState(instrument.stringCount ?? 6);
    const [tempIsElectric, setTempIsElectric] = useState(instrument.isElectric ?? false);
    const [tempKeyCount, setTempKeyCount] = useState(instrument.keyCount ?? 88);
    const [tempIsDigital, setTempIsDigital] = useState(instrument.isDigital ?? false);

    const handleSave = () => {
        const payload = {
            brand: tempBrand,
            instrumentCondition: tempCondition,
            price: parseFloat(tempPrice),          // input fields yield strings
            ...(isGuitar
                ? { stringCount: parseInt(tempStringCount, 10), isElectric: tempIsElectric }
                : { keyCount: parseInt(tempKeyCount, 10), isDigital: tempIsDigital })
        };
        onUpdate(instrument.id, payload);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="instrument-row editing" style={{ border: '2px solid orange', margin: '10px 0', padding: '15px', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', backgroundColor: '#fffdf5' }}>
                <input style={{ flex: 2, padding: '5px' }} type="text" value={tempBrand}
                       onChange={(e) => setTempBrand(e.target.value)} placeholder="Brand" />
                <input style={{ flex: 1, padding: '5px' }} type="text" value={tempCondition}
                       onChange={(e) => setTempCondition(e.target.value)} placeholder="Condition" />
                <input style={{ width: '90px', padding: '5px' }} type="number" step="0.01" value={tempPrice}
                       onChange={(e) => setTempPrice(e.target.value)} placeholder="Price" />

                {/* POLYMORPHIC EDIT FIELDS */}
                {isGuitar ? (
                    <>
                        <input style={{ width: '80px', padding: '5px' }} type="number" value={tempStringCount}
                               onChange={(e) => setTempStringCount(e.target.value)} placeholder="Strings" />
                        <label style={{ fontSize: '0.9rem' }}>
                            <input type="checkbox" checked={tempIsElectric}
                                   onChange={(e) => setTempIsElectric(e.target.checked)} /> Electric
                        </label>
                    </>
                ) : (
                    <>
                        <input style={{ width: '80px', padding: '5px' }} type="number" value={tempKeyCount}
                               onChange={(e) => setTempKeyCount(e.target.value)} placeholder="Keys" />
                        <label style={{ fontSize: '0.9rem' }}>
                            <input type="checkbox" checked={tempIsDigital}
                                   onChange={(e) => setTempIsDigital(e.target.checked)} /> Digital
                        </label>
                    </>
                )}

                <button onClick={handleSave} style={{ backgroundColor: '#28a745', color: 'white', cursor: 'pointer' }}>Save</button>
                <button onClick={() => setIsEditing(false)} style={{ cursor: 'pointer' }}>Cancel</button>
            </div>
        );
    }

    return (
        <div className="instrument-row" style={{ border: '1px solid #ccc', margin: '10px 0', padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9f9f9' }}>
            <div className="instrument-info" style={{ textAlign: 'left' }}>
                <h3 style={{ margin: '0 0 5px 0' }}>
                    <span style={{
                        fontSize: '0.7em',
                        padding: '2px 8px',
                        marginRight: '8px',
                        borderRadius: '10px',
                        color: 'white',
                        backgroundColor: isGuitar ? '#6f42c1' : '#0d6efd'
                    }}>
                        {isGuitar ? 'GUITAR' : 'PIANO'}
                    </span>
                    {instrument.brand}
                </h3>
                <p style={{ margin: 0 }}>
                    <strong>Condition:</strong> {instrument.instrumentCondition} |{' '}
                    <strong>Price:</strong> ${Number(instrument.price ?? 0).toFixed(2)} |{' '}
                    {/* POLYMORPHIC DISPLAY FIELDS */}
                    {isGuitar ? (
                        <>
                            <strong>Strings:</strong> {instrument.stringCount} |{' '}
                            <strong>Type:</strong> {instrument.isElectric ? 'Electric' : 'Acoustic'}
                        </>
                    ) : (
                        <>
                            <strong>Keys:</strong> {instrument.keyCount} |{' '}
                            <strong>Type:</strong> {instrument.isDigital ? 'Digital' : 'Acoustic'}
                        </>
                    )}
                </p>
            </div>

            {/* RBAC UI PRUNING: standard users see the catalogue read-only */}
            {isAdmin && (
                <div className="instrument-actions">
                    <button onClick={() => setIsEditing(true)} style={{ backgroundColor: '#ffc107', marginRight: '5px', cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => onDelete(instrument.id)} style={{ backgroundColor: '#ff4444', color: 'white', cursor: 'pointer' }}>Delete</button>
                </div>
            )}
        </div>
    );
}

/**
 * The niche list page. Owns nothing but presentation + the delete/update
 * callbacks handed down from App.jsx.
 *
 * No token prop, no raw fetch: every call goes through the shared `api`
 * instance, so the request interceptor injects the RSA JWT for us.
 */
function InstrumentList({ instruments, onDelete, onUpdate }) {
    return (
        <div className="instrument-list" style={{ display: 'flex', flexDirection: 'column' }}>
            <h1>Instrument Department</h1>
            <p style={{ marginBottom: '15px' }}>
                Showing {instruments.length} instrument{instruments.length === 1 ? '' : 's'} (Guitars &amp; Pianos)
            </p>

            {instruments.length === 0 && <p>No instruments in the database yet.</p>}

            {instruments.map((item) => (
                <InstrumentRow
                    key={item.id}
                    instrument={item}
                    onDelete={onDelete}
                    onUpdate={onUpdate}
                />
            ))}
        </div>
    );
}

export default InstrumentList;