import React, { useState } from 'react';
import ImageCarousel from './ImageCarousel';
import './App.css';

function App() {
    const [accessGranted, setAccessGranted] = useState(false);
    const [code, setCode] = useState("");
    const [ isMobile, setIsMobile ] = useState(/Mobi|Tabletop|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

    const handleChange = (e) => {
        const value = e.target.value;
        setCode(value);
        if (value === "809") {
            setAccessGranted(true);
        }
    };

    return (
        <div className="App">
            {!accessGranted && (
                <input
                    type="text"
                    value={code}
                    onChange={handleChange}
                    placeholder="Enter access code"
                    style={{ fontSize: '24pt', marginTop: '20pt' }}
                    autoFocus
                />
            )}
            { accessGranted && <ImageCarousel state={{ 'isMobile': isMobile }}/>}
        </div>
    );
}

export default App;

