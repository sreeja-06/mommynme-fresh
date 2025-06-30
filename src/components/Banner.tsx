import React from 'react';

const marqueeStyle: React.CSSProperties = {
    width: '100%',
    background: '#ede1fc', // match project purple shade
    color: '#7c3aed', // Tailwind purple-600
    padding: '10px 0',
    overflow: 'hidden',
    position: 'relative', // not fixed, so it doesn't overlap
    zIndex: 20,
};

const textStyle: React.CSSProperties = {
    display: 'inline-block',
    whiteSpace: 'nowrap',
    animation: 'marquee 12s linear infinite',
    fontWeight: 600,
    fontSize: '1.1rem',
};

const Banner: React.FC = () => (
    <div style={{
        ...marqueeStyle,
        position: 'fixed', // Make banner fixed at top
        top: 0,
        left: 0,
        zIndex: 60, // Above navbar's 50
        height: '40px', // Set a fixed height
        display: 'flex',
        alignItems: 'center',
        width: '100vw', // Ensure full viewport width
        background: '#ede1fc',
    }}>
        <div style={textStyle}>
            Dm in our instagram to order &nbsp; • &nbsp; Dm in our instagram to order &nbsp; • &nbsp; Dm in our instagram to order
        </div>
        <style>
            {`
                @keyframes marquee {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                }
            `}
        </style>
    </div>
);

export default Banner;