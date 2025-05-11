import React from 'react';

const Eagle = ({ position }) => {
  const wrapper = {
    position: 'absolute',
    left: `${position.x}px`,
    top: `${position.y}px`,
    width: '20px',
    height: '8px',
    pointerEvents: 'none'
  };
  const wing = {
    position: 'absolute',
    top: 0,
    width: '8px',
    height: '2px',
    backgroundColor: '#553',
    borderRadius: '1px'
  };
  const body = {
    position: 'absolute',
    top: '2px',
    left: '6px',
    width: '4px',
    height: '4px',
    backgroundColor: '#332',
    borderRadius: '50%'
  };

  return (
    <div style={wrapper}>
      <div style={{ ...wing, transform: 'rotate(45deg)' }} />
      <div style={{ ...wing, transform: 'rotate(-45deg)', left: 'auto', right: 0 }} />
      <div style={body} />
    </div>
  );
};

export default Eagle;
