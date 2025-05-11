import React from 'react';

const Pedestrian = ({ position, color }) => {
  const wrapperStyle = {
    position: 'absolute',
    left: position.x,
    top: `${position.y}px`,
    width: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  };
  const headStyle = {
    width: '8px',
    height: '8px',
    backgroundColor: color,
    borderRadius: '50%'
  };
  const bodyStyle = {
    width: '6px',
    height: '12px',
    backgroundColor: color,
    borderRadius: '3px',
    marginTop: '0px'
  };
  return (
    <div style={wrapperStyle}>
      <div style={headStyle} />
      <div style={bodyStyle} />
    </div>
  );
};

export default Pedestrian;
