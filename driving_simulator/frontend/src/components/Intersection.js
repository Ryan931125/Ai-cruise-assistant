import React, { useState, useEffect } from 'react';

/**
 * Intersection scene component for the driving simulator
 * Redesigned with a cleaner look
 */
const Intersection = ({ position }) => {
  const [trafficLightState, setTrafficLightState] = useState('red');
  
  // Change traffic light state every few seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTrafficLightState(prevState => {
        if (prevState === 'red') return 'green';
        if (prevState === 'green') return 'yellow';
        return 'red';
      });
    }, 5000); // Change every 5 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Calculate the background position based on the car's position
  const backgroundPositionX = -position.x;
  const backgroundPositionY = -position.y;

  // Vertical offset to push the intersection visually upwards
  const verticalOffset = -200; // Adjust this value as needed
  
  // Container style
  const containerStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#7a915b', // Changed to grass color
    overflow: 'hidden',
  };
  
  // Intersection base
  const intersectionBaseStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '360px', // Updated width to align with outer crosswalk edges (80px + 100px) * 2
    height: '360px', // Updated height to align with outer crosswalk edges (80px + 100px) * 2
    backgroundColor: '#555', // Asphalt color
    // Transform remains the same, centering the new dimensions
    transform: `translate(calc(${backgroundPositionX}px - 50%), calc(${backgroundPositionY}px - 50% + ${verticalOffset}px))`,
  };
  
  // Horizontal road
  const horizontalRoadStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '500vw', // Increased width for infinite effect
    height: '120px',
    backgroundColor: '#555', // Ensure road color
    // Apply vertical offset
    transform: `translate(calc(${backgroundPositionX}px - 50%), calc(${backgroundPositionY}px - 50% + ${verticalOffset}px))`,
  };
  
  // Vertical road
  const verticalRoadStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '120px',
    height: '500vh', // Increased height for infinite effect
    backgroundColor: '#555', // Ensure road color
    // Apply vertical offset
    transform: `translate(calc(${backgroundPositionX}px - 50%), calc(${backgroundPositionY}px - 50% + ${verticalOffset}px))`,
  };
  
  // Horizontal lane markings
  const horizontalMarkingsStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '500vw', // Increased width to match road
    height: '120px',
    backgroundImage: `
      linear-gradient(0deg, transparent 8%, #fff 8%, #fff 12%, transparent 12%, transparent 88%, #fff 88%, #fff 92%, transparent 92%)
    `,
    backgroundSize: '100% 100%',
    // Apply vertical offset
    transform: `translate(calc(${backgroundPositionX}px - 50%), calc(${backgroundPositionY}px - 50% + ${verticalOffset}px))`,
  };
  
  // Vertical lane markings
  const verticalMarkingsStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '120px',
    height: '500vh', // Increased height to match road
    backgroundImage: `
      linear-gradient(90deg, transparent 8%, #fff 8%, #fff 12%, transparent 12%, transparent 88%, #fff 88%, #fff 92%, transparent 92%)
    `,
    backgroundSize: '100% 100%',
    // Apply vertical offset
    transform: `translate(calc(${backgroundPositionX}px - 50%), calc(${backgroundPositionY}px - 50% + ${verticalOffset}px))`,
  };

  // Crosswalk Left (was Horizontal)
  const crosswalkLeftStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '100px', // Length of crosswalk along the road
    height: '91px', // Width of crosswalk across the road (fits within 120px road borders)
    backgroundImage: `
      linear-gradient(0deg, 
        transparent 0, transparent 10.5px, 
        #fff 10.5px, #fff 20.5px, 
        transparent 20.5px, transparent 30.5px, 
        #fff 30.5px, #fff 40.5px, 
        transparent 40.5px, transparent 50.5px, 
        #fff 50.5px, #fff 60.5px, 
        transparent 60.5px, transparent 70.5px, 
        #fff 70.5px, #fff 80.5px, 
        transparent 80.5px, transparent 91px
      )
    `, // Explicit 4 lines centered in 91px height
    // Positioned further left, inner edge at -80px from center
    transform: `translate(calc(${backgroundPositionX}px - 180px), calc(${backgroundPositionY}px - 45.5px + ${verticalOffset}px))`,
    opacity: 0.7,
  };

  // Crosswalk Top (was Vertical)
  const crosswalkTopStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '91px', // Width of crosswalk across the road (fits within 120px road borders)
    height: '100px', // Length of crosswalk along the road
    backgroundImage: `
      linear-gradient(90deg, 
        transparent 0, transparent 10.5px, 
        #fff 10.5px, #fff 20.5px, 
        transparent 20.5px, transparent 30.5px, 
        #fff 30.5px, #fff 40.5px, 
        transparent 40.5px, transparent 50.5px, 
        #fff 50.5px, #fff 60.5px, 
        transparent 60.5px, transparent 70.5px, 
        #fff 70.5px, #fff 80.5px, 
        transparent 80.5px, transparent 91px
      )
    `, // Explicit 4 lines centered in 91px width
    // Positioned further up, inner edge at -80px from center
    transform: `translate(calc(${backgroundPositionX}px - 45.5px), calc(${backgroundPositionY}px - 180px + ${verticalOffset}px))`,
    opacity: 0.7,
  };

  // Crosswalk Right
  const crosswalkRightStyle = {
    ...crosswalkLeftStyle, // Inherit base style from left
    // Positioned further right, inner edge at +80px from center
    transform: `translate(calc(${backgroundPositionX}px + 80px), calc(${backgroundPositionY}px - 45.5px + ${verticalOffset}px))`,
  };

  // Crosswalk Bottom
  const crosswalkBottomStyle = {
    ...crosswalkTopStyle, // Inherit base style from top
    // Positioned further down, inner edge at +80px from center
    transform: `translate(calc(${backgroundPositionX}px - 45.5px), calc(${backgroundPositionY}px + 80px + ${verticalOffset}px))`,
  };

  // Traffic light pole
  const trafficLightPoleStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '5px',
    height: '60px',
    backgroundColor: '#222',
    // Position base further outside top-right road border intersection (+70, -60)
    transform: `translate(calc(${backgroundPositionX}px + 70px), calc(${backgroundPositionY}px - 122px + ${verticalOffset}px))`, // Increased X offset
  };
  
  // Traffic light housing
  const trafficLightHousingStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '20px',
    height: '50px',
    backgroundColor: '#333',
    border: '2px solid #222',
    borderRadius: '4px',
    // Position housing centered on top of the pole in the top-right corner
    transform: `translate(calc(${backgroundPositionX}px + 60px), calc(${backgroundPositionY}px - 172px + ${verticalOffset}px))`, // Housing X = 70 - (20/2) = 60
  };
  
  // Traffic light states
  const redLightStyle = {
    position: 'absolute',
    top: '3px', // Adjusted position further up
    left: '50%',
    width: '12px',
    height: '12px',
    backgroundColor: trafficLightState === 'red' ? '#f00' : '#500',
    borderRadius: '50%',
    transform: 'translateX(-50%)',
    boxShadow: trafficLightState === 'red' ? '0 0 5px #f00' : 'none',
  };
  
  const yellowLightStyle = {
    position: 'absolute',
    top: '17px', // Adjusted position further up
    left: '50%',
    width: '12px',
    height: '12px',
    backgroundColor: trafficLightState === 'yellow' ? '#ff0' : '#550',
    borderRadius: '50%',
    transform: 'translateX(-50%)',
    boxShadow: trafficLightState === 'yellow' ? '0 0 5px #ff0' : 'none',
  };
  
  const greenLightStyle = {
    position: 'absolute',
    top: '32px', // Adjusted position further up
    left: '50%',
    width: '12px',
    height: '12px',
    backgroundColor: trafficLightState === 'green' ? '#0f0' : '#050',
    borderRadius: '50%',
    transform: 'translateX(-50%)',
    boxShadow: trafficLightState === 'green' ? '0 0 5px #0f0' : 'none',
  };
  
  return (
    <div style={containerStyle}>
      <div style={horizontalRoadStyle}></div>
      <div style={verticalRoadStyle}></div>
      <div style={intersectionBaseStyle}></div>
      <div style={horizontalMarkingsStyle}></div>
      <div style={verticalMarkingsStyle}></div>
      <div style={crosswalkLeftStyle}></div>
      <div style={crosswalkTopStyle}></div>
      <div style={crosswalkRightStyle}></div>
      <div style={crosswalkBottomStyle}></div>
      <div style={trafficLightPoleStyle}></div>
      <div style={trafficLightHousingStyle}>
        <div style={redLightStyle}></div>
        <div style={yellowLightStyle}></div>
        <div style={greenLightStyle}></div>
      </div>
    </div>
  );
};

export default Intersection;