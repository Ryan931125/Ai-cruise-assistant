import React from 'react';

/**
 * Parking Lot scene component for the driving simulator
 * Modified to represent a large parking lot with horizontal spaces and vertical driveways.
 */
const ParkingLot = ({ position }) => {
  // Calculate the background position based on the car's position
  const backgroundPositionX = -position.x;
  const backgroundPositionY = -position.y;

  // Define dimensions
  const parkingSpaceWidth = 160; // Increased horizontal width of a space
  const parkingSpaceHeight = 80;  // Increased vertical height of a space
  const drivewayWidth = 120;      // Increased vertical width of the driveway
  const lineWidth = 2; // Thickness of the white lines
  const parkingColumnWidth = parkingSpaceWidth; // Parking column width matches space width
  const patternWidth = parkingColumnWidth + drivewayWidth; // Width of one repeating unit (parking column + driveway)

  // Calculate the horizontal offset to center the initial view on the driveway
  // The pattern now starts with parkingColumnWidth, then drivewayWidth.
  // Center of driveway is at parkingColumnWidth + (drivewayWidth / 2)
  const horizontalOffset = parkingColumnWidth + (drivewayWidth / 2);

  // Add a few obstacle boxes in world coordinates
  const obstacles = [
    { id: 1, x: 300, y: 150, width: 50, height: 30 },
    { id: 2, x: 500, y: 300, width: 60, height: 40 },
    { id: 3, x: 800, y: 100, width: 40, height: 40 },
  ];

  // Container style - covers the whole screen
  const containerStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#333', // Base color (Parking area color)
    overflow: 'hidden',
    // Layer multiple backgrounds. The last one listed is drawn first (bottom layer).
    backgroundImage: `
      /* Layer 2: Driveway overlay (drawn on top) - Parking Area First */
      repeating-linear-gradient(
        90deg, /* Vertical stripes */
        transparent, /* Transparent over parking area */
        transparent ${parkingColumnWidth}px,
        #444 ${parkingColumnWidth}px, /* Driveway color */
        #444 ${patternWidth}px
      ),
      /* Layer 1: Horizontal lines (drawn below the driveway overlay) */
      repeating-linear-gradient(
        0deg, /* Horizontal lines */
        transparent,
        transparent ${parkingSpaceHeight - lineWidth}px,
        #fff ${parkingSpaceHeight - lineWidth}px, /* White line */
        #fff ${parkingSpaceHeight}px
      )
    `,
    backgroundSize: `
      ${patternWidth}px 100%, /* Size for Layer 2 (Driveway overlay) */
      100% ${parkingSpaceHeight}px /* Size for Layer 1 (Horizontal lines) */
    `,
    // Apply the calculated position offset + centering offset
    // A positive value shifts the background pattern to the left.
    backgroundPosition: `${backgroundPositionX + horizontalOffset}px ${backgroundPositionY}px`,
    backgroundRepeat: 'repeat', // Ensure the patterns repeat infinitely
  };

  return (
    <div style={containerStyle}>
      {/* Render obstacles on top */}
      {obstacles.map(o => (
        <div
          key={o.id}
          style={{
            position: 'absolute',
            left: o.x + backgroundPositionX + horizontalOffset,
            top: o.y + backgroundPositionY,
            width: o.width,
            height: o.height,
            backgroundColor: 'red',
          }}
        />
      ))}
    </div>
  );
};

export default ParkingLot;