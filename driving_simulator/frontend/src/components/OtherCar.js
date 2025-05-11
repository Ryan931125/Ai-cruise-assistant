import React from 'react';

// Simplified car component for NPC vehicles
const OtherCar = ({ position, color = '#cc3333' }) => { // Default color red
  const car_length = 80;
  const car_width = 30;

  // Base car style using provided position and color
  const carStyle = {
    width: `${car_width}px`,
    height: `${car_length}px`,
    backgroundColor: color,
    position: 'absolute',
    // Position is set directly via top/left
    top: `${position.y}px`, // y is a number
    left: position.x,      // x is potentially a calc() string
    // Center the car visually on its position coordinates
    transform: `translate(-50%, -50%)`,
    borderRadius: '15px 15px 10px 10px',
    zIndex: 9, // Below player car (zIndex 10 in Car.js)
    boxShadow: '0 0 8px rgba(0, 0, 0, 0.4)',
    backgroundImage: `linear-gradient(to bottom, ${color}, ${shadeColor(color, -20)})`, // Simple gradient based on color
  };

  // Simplified visual elements
  const windshield = {
    width: '24px',
    height: '10px',
    backgroundColor: '#aaccff',
    position: 'absolute',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    borderRadius: '3px',
    opacity: 0.7,
  };

   const rearWindshield = {
    width: '22px',
    height: '8px',
    backgroundColor: '#aaccff',
    position: 'absolute',
    bottom: '15px',
    left: '50%',
    transform: 'translateX(-50%)',
    borderRadius: '3px',
    opacity: 0.7,
  };

  const wheelStyle = {
    width: '6px',
    height: '12px',
    backgroundColor: '#333',
    position: 'absolute',
    borderRadius: '2px',
  };

  const frontLeftWheelStyle = { ...wheelStyle, top: '20px', left: '-6px' };
  const frontRightWheelStyle = { ...wheelStyle, top: '20px', right: '-6px' };
  const backLeftWheelStyle = { ...wheelStyle, bottom: '15px', left: '-6px' };
  const backRightWheelStyle = { ...wheelStyle, bottom: '15px', right: '-6px' };

  return (
    <div style={carStyle}>
      <div style={windshield}></div>
      <div style={rearWindshield}></div>
      <div style={frontLeftWheelStyle}></div>
      <div style={frontRightWheelStyle}></div>
      <div style={backLeftWheelStyle}></div>
      <div style={backRightWheelStyle}></div>
    </div>
  );
};

// Helper function to darken/lighten a hex color
function shadeColor(color, percent) {
    let R = parseInt(color.substring(1,3),16);
    let G = parseInt(color.substring(3,5),16);
    let B = parseInt(color.substring(5,7),16);

    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);

    R = (R<255)?R:255;
    G = (G<255)?G:255;
    B = (B<255)?B:255;

    R = Math.round(R)
    G = Math.round(G)
    B = Math.round(B)

    const RR = ((R.toString(16).length===1)?"0"+R.toString(16):R.toString(16));
    const GG = ((G.toString(16).length===1)?"0"+G.toString(16):G.toString(16));
    const BB = ((B.toString(16).length===1)?"0"+B.toString(16):B.toString(16));

    return "#"+RR+GG+BB;
}

export default OtherCar;
