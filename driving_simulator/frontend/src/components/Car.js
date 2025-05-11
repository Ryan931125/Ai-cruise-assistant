import React, { useState, useEffect } from 'react';

/**
 * Car component for the driving simulator
 * Updated to use headlights as turning signals and front is pointing upward
 */
const Car = ({ carState, leftSignalOn = false, rightSignalOn = false }) => {
  const { direction, steering_angle, gear } = carState;
  const [blinkOn, setBlinkOn] = useState(false);
  
  // Updated dimensions - significantly longer in the direction of travel
  const car_length = 80; // Longer car
  const car_width = 30; // Width of car

  // Define car styles
  const carStyle = {
    width: `${car_width}px`, // Width is left-right dimension
    height: `${car_length}px`, // Height is front-back dimension
    backgroundColor: '#3366cc',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: `translate(-50%, -50%) rotate(${direction}deg)`,
    // borderRadius: '12px',
    borderRadius: '15px 15px 10px 10px', // Format: top-left top-right bottom-right bottom-left
    transition: 'transform 0.1s ease',
    zIndex: 10,
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
    backgroundImage: 'linear-gradient(to bottom, #4477dd, #3366cc)',
  };

  // Front headlights that also function as turn signals
  const frontLeftHeadlight = {
    width: '8px',
    height: '6px',
    // backgroundColor: leftSignalOn && blinkOn ? '#ffcc00' : '#ffdd55', // Yellow when blinking, orange when not
    backgroundColor: leftSignalOn && blinkOn ? '#ffcc00' : (leftSignalOn ? '#444' : '#ffdd55'),
    position: 'absolute',
    top: '6px', // Near the top edge (front)
    left: '4px',
    borderRadius: '3px',
    border: '1px solid rgba(0, 0, 0, 0.2)', // Subtle border
    boxShadow: leftSignalOn && blinkOn ? '0 0 6px #ffcc00' : '0 0 6px #444',
  };

  const frontRightHeadlight = {
    width: '8px',
    height: '6px',
    backgroundColor: rightSignalOn && blinkOn ? '#ffcc00' : (rightSignalOn ? '#444' : '#ffdd55'),
    position: 'absolute',
    top: '6px', // Near the top edge (front)
    right: '4px',
    borderRadius: '3px',
    border: '1px solid rgba(0, 0, 0, 0.2)',
    boxShadow: rightSignalOn && blinkOn ? '0 0 6px #ffcc00' : '0 0 6px #444',
  };

  // Front grill styling
  const frontGrill = {
    width: '20px',
    height: '4px',
    backgroundColor: '#222222',
    position: 'absolute',
    top: '15px',
    left: '50%',
    transform: 'translateX(-50%)',
    borderRadius: '2px',
  };

  // Windshield styling
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

  // Rear windshield styling
  const rearWindshield = {
    width: '22px', // Slightly narrower than front
    height: '8px', // Slightly shorter than front
    backgroundColor: '#aaccff', // Same color as front
    position: 'absolute',
    bottom: '15px', // Position near the back
    left: '50%',
    transform: 'translateX(-50%)',
    borderRadius: '3px', // Same rounding
    opacity: 0.7, // Same opacity
  };

  // Back indicator style (taillights at the bottom - back of car)
  const backLeftTaillight = {
    width: '8px',
    height: '5px',
    backgroundColor: '#dd0000', // Taillight color
    position: 'absolute',
    bottom: '3px', // Near the bottom edge (back)
    left: '3px',
    borderRadius: '2px',
    boxShadow: '0 0 4px #ff0000',
    border: '1px solid rgba(0, 0, 0, 0.2)', // Subtle border
  };

  const backRightTaillight = {
    width: '8px',
    height: '5px',
    backgroundColor: '#dd0000', // Taillight color
    position: 'absolute',
    bottom: '3px', // Near the bottom edge (back)
    right: '3px',
    borderRadius: '2px',
    boxShadow: '0 0 4px #ff0000',
    border: '1px solid rgba(0, 0, 0, 0.2)', // Subtle border
  };

  // Wheels style
  const wheelStyle = {
    width: '6px',
    height: '12px',
    backgroundColor: '#333',
    position: 'absolute',
    borderRadius: '2px',
  };

  const frontLeftWheelStyle = {
    ...wheelStyle,
    top: '20px',
    left: '-6px',
    transform: `rotate(${steering_angle}deg)`,
    transition: 'transform 0.2s ease',
  };

  const frontRightWheelStyle = {
    ...wheelStyle,
    top: '20px',
    right: '-6px',
    transform: `rotate(${steering_angle}deg)`,
    transition: 'transform 0.2s ease',
  };

  const backLeftWheelStyle = {
    ...wheelStyle,
    bottom: '15px',
    left: '-6px',
  };

  const backRightWheelStyle = {
    ...wheelStyle,
    bottom: '15px',
    right: '-6px',
  };

  // Gear indicator
  const gearIndicatorStyle = {
    position: 'absolute',
    top: '55%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 'bold',
  };

  // Direction indicator (shows which way is forward)
  // const directionIndicator = {
  //   width: '0',
  //   height: '0',
  //   position: 'absolute',
  //   top: '0',
  //   left: '50%',
  //   transform: 'translateX(-50%)',
  //   borderLeft: '6px solid transparent',
  //   borderRight: '6px solid transparent',
  //   borderBottom: '8px solid #ff5500', // Arrow pointing to the front
  // };

  // Blink effect for turn signals
  useEffect(() => {
    let interval;
    
    if (leftSignalOn || rightSignalOn) {
      interval = setInterval(() => {
        setBlinkOn(prev => !prev);
      }, 500);
    } else {
      setBlinkOn(false);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [leftSignalOn, rightSignalOn]);

  // Handle hazard lights (both signals on)
  // const isHazardOn = leftSignalOn && rightSignalOn;

  return (
    <div style={carStyle}>
      {/* Direction indicator (pointing forward) */}
      {/* <div style={directionIndicator}></div> */}
      
      {/* Front components (headlights, grill, windshield) */}
      <div style={frontLeftHeadlight}></div>
      <div style={frontRightHeadlight}></div>
      <div style={frontGrill}></div>
      <div style={windshield}></div>
      
      {/* Back components (taillights) */}
      <div style={backLeftTaillight}></div>
      <div style={backRightTaillight}></div>
      <div style={rearWindshield}></div> {/* Add this line */}

      
      {/* Wheels */}
      <div style={frontLeftWheelStyle}></div>
      <div style={frontRightWheelStyle}></div>
      <div style={backLeftWheelStyle}></div>
      <div style={backRightWheelStyle}></div>
      
      {/* Gear indicator */}
      <div style={gearIndicatorStyle}>{gear}</div>
    </div>
  );
};

export default Car;