import { useState } from 'react';
import api from './api/axiosConfig';

/**
 * Creates a new Guitar or Piano.
 *
 * The type selector decides which concrete subclass we POST to, so the backend
 * never has to guess which subtype to instantiate:
 *   Guitar -> POST /api/rest/instruments/guitars
 *   Piano  -> POST /api/rest/instruments/pianos
 *
 * No token prop anywhere: `api` attaches the Bearer header via its request
 * interceptor. A non-admin who reaches this form gets a 403 from the backend,
 * which is the point - the UI hiding is convenience, the server is the wall.
 */
function InstrumentForm({ onInstrumentAdded }) {
    const [type, setType] = useState('guitar');

    // Shared InstrumentEntity fields
    const [brand, setBrand] = useState('');
    const [instrumentCondition, setInstrumentCondition] = useState('New');
    const [price, setPrice] = useState(0.0);

    // Guitar-only
    const [stringCount, setStringCount] = useState(6);
    const [isElectric, setIsElectric] = useState(false);

    // Piano-only
    const [keyCount, setKeyCount] = useState(88);
    const [isDigital, setIsDigital] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();

        const isGuitar = type === 'guitar';

        // TYPE CONVERSION: every <input> hands back a string. The Java side
        // expects Double for price and Integer for the counts, so parse before
        // sending or Jackson will reject the body.
        const payload = {
            brand,
            instrumentCondition,
            price: parseFloat(price),
            ...(isGuitar
                ? { stringCount: parseInt(stringCount, 10), isElectric }
                : { keyCount: parseInt(keyCount, 10), isDigital })
        };

        const endpoint = isGuitar ? '/rest/instruments/guitars' : '/rest/instruments/pianos';

        api.post(endpoint, payload)
            .then(response => {
                alert(`${isGuitar ? 'Guitar' : 'Piano'} saved to the RSA-secured database.`);
                onInstrumentAdded(response.data);
                // Reset the form
                setBrand('');
                setInstrumentCondition('New');
                setPrice(0.0);
                setStringCount(6);
                setIsElectric(false);
                setKeyCount(88);
                setIsDigital(false);
            })
            .catch(err => {
                console.error('Save Error:', err);
                alert('Unauthorized: you do not have permission to add instruments.');
            });
    };

    return (
        <div style={{ border: '2px solid blue', padding: '20px', marginBottom: '20px', borderRadius: '8px' }}>
            <h3>Add New Instrument (Secured via Axios)</h3>

            <form onSubmit={handleSubmit}>
                {/* TYPE SELECTOR - drives which subclass is created */}
                <div style={{ marginBottom: '15px', textAlign: 'left' }}>
                    <label style={{ marginRight: '20px', fontWeight: 'bold' }}>
                        <input type="radio" name="type" value="guitar"
                               checked={type === 'guitar'}
                               onChange={(e) => setType(e.target.value)} /> Guitar
                    </label>
                    <label style={{ fontWeight: 'bold' }}>
                        <input type="radio" name="type" value="piano"
                               checked={type === 'piano'}
                               onChange={(e) => setType(e.target.value)} /> Piano
                    </label>
                </div>

                {/* SHARED FIELDS */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        placeholder="Brand"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        required
                        style={{ flex: 2, padding: '8px' }}
                    />
                    <select
                        value={instrumentCondition}
                        onChange={(e) => setInstrumentCondition(e.target.value)}
                        style={{ flex: 1, padding: '8px' }}
                    >
                        <option value="New">New</option>
                        <option value="Used">Used</option>
                        <option value="Refurbished">Refurbished</option>
                    </select>
                    <input
                        type="number"
                        step="0.01"
                        placeholder="Price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                        style={{ width: '110px', padding: '8px' }}
                    />

                    {/* SUBCLASS-SPECIFIC FIELDS */}
                    {type === 'guitar' ? (
                        <>
                            <input
                                type="number"
                                placeholder="Strings"
                                value={stringCount}
                                onChange={(e) => setStringCount(e.target.value)}
                                required
                                style={{ width: '100px', padding: '8px' }}
                            />
                            <label style={{ whiteSpace: 'nowrap' }}>
                                <input type="checkbox" checked={isElectric}
                                       onChange={(e) => setIsElectric(e.target.checked)} /> Electric
                            </label>
                        </>
                    ) : (
                        <>
                            <input
                                type="number"
                                placeholder="Keys"
                                value={keyCount}
                                onChange={(e) => setKeyCount(e.target.value)}
                                required
                                style={{ width: '100px', padding: '8px' }}
                            />
                            <label style={{ whiteSpace: 'nowrap' }}>
                                <input type="checkbox" checked={isDigital}
                                       onChange={(e) => setIsDigital(e.target.checked)} /> Digital
                            </label>
                        </>
                    )}

                    <button type="submit" style={{ width: '160px', padding: '8px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
                        Save to Backend
                    </button>
                </div>
            </form>
        </div>
    );
}

export default InstrumentForm;