import React, { useState, useEffect, useRef } from 'react';
import OtherCar from './OtherCar'; // Import the new component
import Pedestrian from './Pedestrian'; // Import the Pedestrian component
import Eagle from './Eagle'; // <-- new import

// Define lane center percentages relative to the container width
// Road is centered, 40% width. Lanes divide this 40% into three 13.33% sections.
// Center of left lane: 50% - (1/3 * 40%) = 50% - 13.33% = 36.67%
// Center of middle lane: 50%
// Center of right lane: 50% + (1/3 * 40%) = 50% + 13.33% = 63.33%
const laneCenters = ['36.67%', '50%', '63.33%'];
const roadWidthPercentage = 40; // Keep consistent with roadStyle

// Add side centers at road edges
const sideCenters = [
  `${50 - roadWidthPercentage / 2}%`,
  `${50 + roadWidthPercentage / 2}%`
];

// Initial state for other cars - Increased count and spread out positive worldY (behind player)
const initialOtherCars = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  // Spread cars out significantly behind the player initially - INCREASED SPACING
  worldY: 800 + i * 800 + Math.random() * 400, // Start behind, spaced by ~800-1200 units
  laneIndex: Math.floor(Math.random() * 3), // Random lane
  speed: 1.5 + Math.random() * 1.5, // Random speed between 1.5 and 3.0
  color: `hsl(${Math.random() * 360}, 60%, 50%)`, // Random color
}));

// Initial state for pedestrians
const initialPedestrians = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  worldY: 800 + i * 400 + Math.random() * 400,
  sideIndex: Math.floor(Math.random() * 2),
  speed: 0.5 + Math.random() * 0.5,
  color: `hsl(${Math.random() * 360}, 70%, 60%)`,
}));

// Total distance before recycling a car - INCREASED
const recycleDistance = 15000; // Increased range significantly
// Where cars respawn relative to player view center (behind the player) - INCREASED
const spawnDistanceBehind = recycleDistance * 0.9; // e.g., 13500 units behind

/**
 * Highway scene component for the driving simulator
 * Modified to support both horizontal and vertical movement and display other cars
 */
const Highway = ({ position }) => {
  const [otherCars, setOtherCars] = useState(initialOtherCars);
  const [pedestrians, setPedestrians] = useState(initialPedestrians); // Add pedestrians state
  const lastTimestampRef = useRef(performance.now());
  const animationFrameIdRef = useRef();

  // initial eagle flock
  const initialEagles = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    x: Math.random() * window.innerWidth,
    y: Math.random() * 100 + 20,
    speedX: (Math.random() < 0.5 ? 1 : -1) * (1 + Math.random() * 2)
  }));
  const [eagles, setEagles] = useState(initialEagles); // <-- new state

  // Include both x and y positions for proper turning and movement
  const backgroundPositionX = -position.x;
  const backgroundPositionY = -position.y; // This represents the player's world Y position essentially

  // Update other car positions based on their speed and elapsed time
  useEffect(() => {
    const animate = (timestamp) => {
      const deltaTime = timestamp - lastTimestampRef.current;
      lastTimestampRef.current = timestamp;

      // Avoid large jumps on first frame or after lag
      if (deltaTime > 100) {
        animationFrameIdRef.current = requestAnimationFrame(animate);
        return;
      }

      setOtherCars((prevCars) =>
        prevCars.map((car) => {
          // Cars move "up" the screen (decreasing worldY)
          let newWorldY = car.worldY - car.speed * (deltaTime / 10); // SUBTRACT speed

          // Check if car is far ahead the player's view center
          const playerWorldY = -backgroundPositionY;
          const carRelativeY = newWorldY - playerWorldY; // Negative value means car is ahead

          // If car is too far ahead (large negative relative Y), recycle it
          if (carRelativeY < -recycleDistance / 2) {
            // Check if it's beyond the forward recycle distance
            // Reset position far behind the player
            return {
              ...car,
              // Place it 'spawnDistanceBehind' relative to the player's current position
              worldY: playerWorldY + spawnDistanceBehind + Math.random() * 2000, // Spawn behind, larger random offset
              laneIndex: Math.floor(Math.random() * 3), // Random lane
              speed: 1.5 + Math.random() * 1.5, // Optional: re-randomize speed
              color: `hsl(${Math.random() * 360}, 60%, 50%)`, // Optional: re-randomize color
            };
          }

          return { ...car, worldY: newWorldY };
        })
      );

      setPedestrians((prevPedestrians) =>
        prevPedestrians.map((pedestrian) => {
          let newWorldY = pedestrian.worldY - pedestrian.speed * (deltaTime / 10);
          const playerWorldY = -backgroundPositionY;
          const pedestrianRelativeY = newWorldY - playerWorldY;

          if (pedestrianRelativeY < -recycleDistance / 2) {
            return {
              ...pedestrian,
              worldY: playerWorldY + spawnDistanceBehind + Math.random() * 2000,
              sideIndex: Math.floor(Math.random() * 2),
              speed: 0.5 + Math.random() * 0.5,
              color: `hsl(${Math.random() * 360}, 70%, 60%)`,
            };
          }

          return { ...pedestrian, worldY: newWorldY };
        })
      );

      // update eagles horizontal flight
      setEagles(prev =>
        prev.map(e => {
          const newX = e.x + e.speedX * (deltaTime / 10);
          if (newX < -50 || newX > window.innerWidth + 50) {
            return {
              ...e,
              x: newX < -50 ? window.innerWidth + 50 : -50,
              y: Math.random() * 100 + 20,
              speedX: (Math.random() < 0.5 ? 1 : -1) * (1 + Math.random() * 2)
            };
          }
          return { ...e, x: newX };
        })
      );

      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    animationFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run effect once on mount to start the animation loop

  // Container style
  const containerStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    // Use viewport units to ensure it covers the screen
    width: '100vw',
    height: '100vh',
    backgroundColor: '#7a915b', // Green grass color from image
    overflow: 'hidden',
  };

  // Main road style with position affected by both X and Y movement
  const roadStyle = {
    position: 'absolute',
    top: 0,
    left: '50%',
    width: `${roadWidthPercentage}%`, // Use variable
    height: '100%',
    backgroundColor: '#4d4c47', // Dark asphalt color from image
    transform: `translateX(calc(-50% + ${backgroundPositionX}px))`,
  };

  // Road edge (solid white lines) with X and Y movement
  const roadEdgeStyle = {
    position: 'absolute',
    top: 0,
    left: '50%',
    width: `${roadWidthPercentage}%`, // Use variable
    height: '100%',
    boxSizing: 'border-box',
    border: '0 solid #fff',
    borderLeftWidth: '6px',
    borderRightWidth: '6px',
    transform: `translateX(calc(-50% + ${backgroundPositionX}px))`,
  };

  // Common properties for lane lines
  const baseLaneLineStyle = {
    position: 'absolute',
    top: 0,
    width: '4px', // Width of the dashed line
    height: '100%',
    backgroundImage: 'linear-gradient(to bottom, white 60px, transparent 60px)',
    backgroundSize: '4px 120px', // Dashed pattern
    backgroundPosition: `0 ${backgroundPositionY}px`, // Vertical movement based on player
    // Center the line element itself relative to its 'left' position
    transform: `translateX(-50%)`,
  };

  // First dashed line (left)
  const laneLine1Style = {
    ...baseLaneLineStyle,
    // Positioned 1/3 of the way across the road width from the center towards the left
    // Road width = 40%, Offset = -(1/6) * 40% = -6.666%
    // Adjusted for backgroundPositionX
    left: `calc(50% - ${roadWidthPercentage / 6}% + ${backgroundPositionX}px)`,
  };

  // Second dashed line (right)
  const laneLine2Style = {
    ...baseLaneLineStyle,
    // Positioned 1/3 of the way across the road width from the center towards the right
    // Road width = 40%, Offset = +(1/6) * 40% = +6.666%
    // Adjusted for backgroundPositionX
    left: `calc(50% + ${roadWidthPercentage / 6}% + ${backgroundPositionX}px)`,
  };

  return (
    <div style={containerStyle}>
      <div style={roadStyle}></div>
      <div style={roadEdgeStyle}></div>
      <div style={laneLine1Style}></div> {/* Dashed line 1 */}
      <div style={laneLine2Style}></div> {/* Dashed line 2 */}

      {/* Render other cars */}
      {otherCars.map((car) => {
        // Calculate screen position based on worldY, backgroundPositionY, and lane
        const screenY = car.worldY + backgroundPositionY + window.innerHeight / 2;
        const screenXPercent = laneCenters[car.laneIndex];
        const carLeft = `calc(${screenXPercent} + ${backgroundPositionX}px)`;

        // Basic visibility check (render if within ~1.5 screen heights above/below center)
        const viewHeight = window.innerHeight;
        if (screenY > -viewHeight * 1.5 && screenY < viewHeight * 2.5) {
          // Slightly larger render window
          return (
            <OtherCar
              key={car.id}
              position={{ x: carLeft, y: screenY }}
              color={car.color}
            />
          );
        }
        return null; // Don't render if too far off-screen
      })}

      {/* Render pedestrians */}
      {pedestrians.map((pedestrian) => {
        const screenY = pedestrian.worldY + backgroundPositionY + window.innerHeight / 2;
        const screenX = `calc(${sideCenters[pedestrian.sideIndex]} + ${backgroundPositionX}px)`;

        if (screenY > -window.innerHeight && screenY < window.innerHeight * 2) {
          return (
            <Pedestrian
              key={pedestrian.id}
              position={{ x: screenX, y: screenY }}
              color={pedestrian.color}
            />
          );
        }
        return null;
      })}

      {/* Render eagles */}
      {eagles.map(e => (
        <Eagle
          key={e.id}
          position={{ x: e.x, y: e.y }}   // numbers in px
        />
      ))}
    </div>
  );
};

export default Highway;