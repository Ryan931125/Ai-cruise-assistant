import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Car from './components/Car';
import Highway from './components/Highway';
import ParkingLot from './components/ParkingLot';
import Intersection from './components/Intersection';
import SocketHandler from './utils/socketHandler';

function App() {
  // State for the car and scene
  const [carState, setCarState] = useState({
    position: { x: 0, y: 0 },
    speed: 0,
    direction: 0,
    gear: 'P',
    steering_angle: 0,
    acceleration_rate: 0,
    deceleration_rate: 0,
    car_length: 60,
    car_width: 25,
    turning_signal: "N"
  });
  
  const [currentScene, setCurrentScene] = useState('highway');
  const [socketConnected, setSocketConnected] = useState(false);
  const [socket, setSocket] = useState(null);
  
  // Independent turn signal states
  const [leftSignalOn, setLeftSignalOn] = useState(false);
  const [rightSignalOn, setRightSignalOn] = useState(false);
  
  // Analog acceleration and braking levels
  const accelerationLevels = [0, 20, 40, 60, 80, 100];
  const [currentAccelLevel, setCurrentAccelLevel] = useState(0);
  const [currentBrakeLevel, setCurrentBrakeLevel] = useState(0);
  
  // Distance traveled for 60-second drive measurement
  const [distanceTraveled, setDistanceTraveled] = useState(0);
  const [driveStartTime, setDriveStartTime] = useState(null);
  const [driveDuration, setDriveDuration] = useState(0);
  
  // Track active keys with useRef to prevent re-render issues
  const activeKeys = useRef(new Set());
  
  // Initialize socket connection
  useEffect(() => {
    const socketHandler = new SocketHandler('ws://localhost:8765');
    
    socketHandler.onStateUpdate = (car, scene) => {
      setCarState(car);
      setCurrentScene(scene);
      
      // Update distance traveled
      if (driveStartTime && car.speed > 0 && car.gear === 'D') {
        const newDistanceTraveled = distanceTraveled + (car.speed * 0.016); // Assuming 60fps
        setDistanceTraveled(newDistanceTraveled);
        
        // Update drive duration
        const currentTime = Date.now();
        const newDuration = Math.floor((currentTime - driveStartTime) / 1000);
        setDriveDuration(newDuration);
      }
    };
    
    socketHandler.onSceneChanged = (scene) => {
      setCurrentScene(scene);
      // Reset distance and time when scene changes
      setDistanceTraveled(0);
      setDriveStartTime(null);
      setDriveDuration(0);
    };
    
    socketHandler.connect();
    setSocket(socketHandler);
    
    return () => {
      socketHandler.disconnect();
    };
  }, []);
  
  // get data from socket (Arduino)
  useEffect(() => {
    if (carState.turning_signal == "L"){
      setLeftSignalOn(true), setRightSignalOn(false);
    } else if(carState.turning_signal == "R") {
      setLeftSignalOn(true), setRightSignalOn(false);
    } else {
      setLeftSignalOn(false), setRightSignalOn(false);
    }

  }, [carState.turning_signal]);

  useEffect(()=>{
    setCurrentAccelLevel(carState.acceleration_rate);
    setCurrentBrakeLevel(carState.deceleration_rate);
    setCurrentScene(carState.scene);
  },[carState.acceleration_rate, carState.deceleration_rate, carState.scene]);



  // Update socket connection status
  useEffect(() => {
    if (socket) {
      const checkConnection = setInterval(() => {
        setSocketConnected(socket.isConnected);
      }, 1000);
      
      return () => {
        clearInterval(checkConnection);
      };
    }
  }, [socket]);
  
  // Start drive timer when car starts moving
  useEffect(() => {
    if (carState.speed > 0 && carState.gear === 'D' && !driveStartTime) {
      setDriveStartTime(Date.now());
    }
    
    // Reset timer if car stops or changes gear
    if ((carState.speed === 0 || carState.gear !== 'D') && driveStartTime) {
      setDriveStartTime(null);
      setDistanceTraveled(0);
      setDriveDuration(0);
    }
  }, [carState.speed, carState.gear, driveStartTime]);
  
  // Apply the current acceleration or brake level
  const applyCurrentAcceleration = () => {
    if (!socket || !socket.isConnected) return;
    
    // Get the appropriate acceleration value based on gear and level
    let acceleration = 0;
    
    // In Drive, only allow positive acceleration (forward)
    if (carState.gear === 'D') {
      if (currentAccelLevel > 0) {
        acceleration = accelerationLevels[currentAccelLevel];
      } else if (currentBrakeLevel > 0) {
        // Braking in Drive - just slow down, don't apply negative acceleration
        acceleration = 0; // This will let the car gradually stop due to friction
      }
    } 
    // In Reverse, only allow negative acceleration (backward)
    else if (carState.gear === 'R') {
      if (currentAccelLevel > 0) {
        // In reverse, acceleration should be negative to move backward
        acceleration = -accelerationLevels[currentAccelLevel];
      } else if (currentBrakeLevel > 0) {
        // Braking in Reverse - just slow down, don't apply positive acceleration
        acceleration = 0; // This will let the car gradually stop due to friction
      }
    }
    // In Park, no acceleration
    else {
      acceleration = 0;
    }
    
    socket.sendControls({ acceleration });
  };
  
  // Handle key press for manual control with analog behavior
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!socket || !socket.isConnected) return;
      
      // Prevent default behavior for arrow keys to avoid page scrolling
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'q', 'e'].includes(e.key)) {
        e.preventDefault();
      }
      
      // Add to active keys
      activeKeys.current.add(e.key);
      
      console.log('Key pressed:', e.key, 'Active keys:', Array.from(activeKeys.current));
      
      switch (e.key) {
        case 'ArrowUp':
          // In Drive, acceleration increases speed forward
          // In Reverse, acceleration increases speed backward
          setCurrentBrakeLevel(0); // Reset brake when accelerating
          setCurrentAccelLevel(prev => Math.min(prev + 1, accelerationLevels.length - 1));
          break;
        case 'ArrowDown':
          // In any gear, brake slows the car down
          setCurrentAccelLevel(0); // Reset acceleration when braking
          setCurrentBrakeLevel(prev => Math.min(prev + 1, accelerationLevels.length - 1));
          break;
        case 'ArrowLeft':
          // Steer left
          socket.sendControls({ steering_angle: -30 });
          break;
        case 'ArrowRight':
          // Steer right
          socket.sendControls({ steering_angle: 30 });
          break;
        case 'q': 
          // Toggle left turn signal
          setLeftSignalOn(prev => !prev);
          if (rightSignalOn) setRightSignalOn(false); // Turn off right signal if it's on
          break;
        case 'e':
          // Toggle right turn signal
          setRightSignalOn(prev => !prev);
          if (leftSignalOn) setLeftSignalOn(false); // Turn off left signal if it's on
          break;
        case 'p':
        case 'P':
          // Park
          socket.sendControls({ gear: 'P' });
          break;
        case 'd':
        case 'D':
          // Drive
          socket.sendControls({ gear: 'D' });
          break;
        case 'r':
        case 'R':
          // Reverse
          socket.sendControls({ gear: 'R' });
          break;
        case ' ': // Spacebar for hazard lights
          // Toggle both turn signals for hazard lights
          if (leftSignalOn && rightSignalOn) {
            setLeftSignalOn(false);
            setRightSignalOn(false);
          } else {
            setLeftSignalOn(true);
            setRightSignalOn(true);
          }
          break;
        default:
          break;
      }
      
      // Apply the current acceleration or brake level
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        applyCurrentAcceleration();
      }
    };
    
    const handleKeyUp = (e) => {
      if (!socket || !socket.isConnected) return;
      
      // Remove from active keys
      activeKeys.current.delete(e.key);
      
      console.log('Key released:', e.key, 'Active keys:', Array.from(activeKeys.current));
      
      switch (e.key) {
        case 'ArrowUp':
          // If we released up and down is pressed, apply braking
          if (activeKeys.current.has('ArrowDown')) {
            setCurrentAccelLevel(0);
            // Don't reset brake level here, let it continue at current level
          } else {
            // Gradually decrease acceleration (simulate letting off the gas)
            // This will cause the car to gradually stop due to friction
            setCurrentAccelLevel(prev => Math.max(prev - 1, 0));
            
            // If acceleration reached zero, ensure we send that value to let the car gradually stop
            if (currentAccelLevel <= 1) {
              // Send a zero acceleration to let the physics handle gradual stopping
              socket.sendControls({ acceleration: 0 });
            }
          }
          break;
        case 'ArrowDown':
          // If we released down and up is pressed, apply acceleration
          if (activeKeys.current.has('ArrowUp')) {
            setCurrentBrakeLevel(0);
            // Don't reset accel level here, let it continue at current level
          } else {
            // Gradually decrease braking
            setCurrentBrakeLevel(prev => Math.max(prev - 1, 0));
            
            // If braking reached zero, ensure we send that value
            if (currentBrakeLevel <= 1) {
              // Send a zero acceleration to let the physics handle gradual stopping
              socket.sendControls({ acceleration: 0 });
            }
          }
          break;
        case 'ArrowLeft':
          // Check if right is still pressed
          if (activeKeys.current.has('ArrowRight')) {
            socket.sendControls({ steering_angle: 30 });
          } else {
            socket.sendControls({ steering_angle: 0 });
          }
          break;
        case 'ArrowRight':
          // Check if left is still pressed
          if (activeKeys.current.has('ArrowLeft')) {
            socket.sendControls({ steering_angle: -30 });
          } else {
            socket.sendControls({ steering_angle: 0 });
          }
          break;
        default:
          break;
      }
      
      // Apply any changes to acceleration or braking
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        applyCurrentAcceleration();
      }
    };
    
    // Add click handlers for on-screen controls
    const handleAccelerate = () => {
      if (!socket || !socket.isConnected) return;
      setCurrentBrakeLevel(0);
      setCurrentAccelLevel(accelerationLevels.length - 1); // Max acceleration
      applyCurrentAcceleration();
    };
    
    const handleBrake = () => {
      if (!socket || !socket.isConnected) return;
      setCurrentAccelLevel(0);
      setCurrentBrakeLevel(accelerationLevels.length - 1); // Max braking
      applyCurrentAcceleration();
    };
    
    const handleSteerLeft = () => {
      if (!socket || !socket.isConnected) return;
      socket.sendControls({ steering_angle: -30 });
    };
    
    const handleSteerRight = () => {
      if (!socket || !socket.isConnected) return;
      socket.sendControls({ steering_angle: 30 });
    };
    
    const handleStopAccelerate = () => {
      if (!socket || !socket.isConnected) return;
      setCurrentAccelLevel(0);
      setCurrentBrakeLevel(0);
      socket.sendControls({ acceleration: 0 });
    };
    
    const handleCenterSteering = () => {
      if (!socket || !socket.isConnected) return;
      socket.sendControls({ steering_angle: 0 });
    };
    
    // Add event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Find and attach on-screen control listeners
    const accelerateBtn = document.getElementById('accelerate-btn');
    const brakeBtn = document.getElementById('brake-btn');
    const steerLeftBtn = document.getElementById('steer-left-btn');
    const steerRightBtn = document.getElementById('steer-right-btn');
    
    if (accelerateBtn) {
      accelerateBtn.addEventListener('mousedown', handleAccelerate);
      accelerateBtn.addEventListener('touchstart', handleAccelerate);
      accelerateBtn.addEventListener('mouseup', handleStopAccelerate);
      accelerateBtn.addEventListener('touchend', handleStopAccelerate);
    }
    
    if (brakeBtn) {
      brakeBtn.addEventListener('mousedown', handleBrake);
      brakeBtn.addEventListener('touchstart', handleBrake);
      brakeBtn.addEventListener('mouseup', handleStopAccelerate);
      brakeBtn.addEventListener('touchend', handleStopAccelerate);
    }
    
    if (steerLeftBtn) {
      steerLeftBtn.addEventListener('mousedown', handleSteerLeft);
      steerLeftBtn.addEventListener('touchstart', handleSteerLeft);
      steerLeftBtn.addEventListener('mouseup', handleCenterSteering);
      steerLeftBtn.addEventListener('touchend', handleCenterSteering);
    }
    
    if (steerRightBtn) {
      steerRightBtn.addEventListener('mousedown', handleSteerRight);
      steerRightBtn.addEventListener('touchstart', handleSteerRight);
      steerRightBtn.addEventListener('mouseup', handleCenterSteering);
      steerRightBtn.addEventListener('touchend', handleCenterSteering);
    }
    
    console.log('Event listeners attached');
    
    return () => {
      // Remove event listeners on cleanup
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      
      // Remove on-screen control listeners
      if (accelerateBtn) {
        accelerateBtn.removeEventListener('mousedown', handleAccelerate);
        accelerateBtn.removeEventListener('touchstart', handleAccelerate);
        accelerateBtn.removeEventListener('mouseup', handleStopAccelerate);
        accelerateBtn.removeEventListener('touchend', handleStopAccelerate);
      }
      
      if (brakeBtn) {
        brakeBtn.removeEventListener('mousedown', handleBrake);
        brakeBtn.removeEventListener('touchstart', handleBrake);
        brakeBtn.removeEventListener('mouseup', handleStopAccelerate);
        brakeBtn.removeEventListener('touchend', handleStopAccelerate);
      }
      
      if (steerLeftBtn) {
        steerLeftBtn.removeEventListener('mousedown', handleSteerLeft);
        steerLeftBtn.removeEventListener('touchstart', handleSteerLeft);
        steerLeftBtn.removeEventListener('mouseup', handleCenterSteering);
        steerLeftBtn.removeEventListener('touchend', handleCenterSteering);
      }
      
      if (steerRightBtn) {
        steerRightBtn.removeEventListener('mousedown', handleSteerRight);
        steerRightBtn.removeEventListener('touchstart', handleSteerRight);
        steerRightBtn.removeEventListener('mouseup', handleCenterSteering);
        steerRightBtn.removeEventListener('touchend', handleCenterSteering);
      }
      
      console.log('Event listeners removed');
    };
  }, [socket, currentAccelLevel, currentBrakeLevel]);
  
  // Render the current scene
  const renderScene = () => {
    switch (currentScene) {
      case 'highway':
        return <Highway position={carState.position} />;
      case 'parking_lot':
        return <ParkingLot position={carState.position} />;
      case 'intersection':
        return <Intersection position={carState.position} />;
      default:
        return <Highway position={carState.position} />;
    }
  };
  
  // Change scene handler
  const changeScene = (scene) => {
    if (socket && socket.isConnected) {
      console.log(`Changing scene to: ${scene}`);
      socket.setScene(scene);
      
      // Reset turn signals when changing scenes
      setLeftSignalOn(false);
      setRightSignalOn(false);
    }
  };
  
  // Helper function to get the current acceleration display level (for UI)
  const getAccelerationLevelDisplay = () => {
    if (currentAccelLevel > 0) {
      return `+${currentAccelLevel}`;
    } else if (currentBrakeLevel > 0) {
      return `-${currentBrakeLevel}`;
    }
    return "0";
  };
  
  // Add buttons for turn signals
  const toggleLeftSignal = () => {
    setLeftSignalOn(prev => !prev);
    if (rightSignalOn) setRightSignalOn(false);
  };
  
  const toggleRightSignal = () => {
    setRightSignalOn(prev => !prev);
    if (leftSignalOn) setLeftSignalOn(false);
  };
  
  const toggleHazardLights = () => {
    if (leftSignalOn && rightSignalOn) {
      setLeftSignalOn(false);
      setRightSignalOn(false);
    } else {
      setLeftSignalOn(true);
      setRightSignalOn(true);
    }
  };
  
  return (
    <div className="App">
      <div className="simulator-container">
        {renderScene()}
        <Car carState={carState} leftSignalOn={leftSignalOn} rightSignalOn={rightSignalOn} />
        
        <div className="controls-overlay">
          <div className="connection-status">
            {socketConnected ? 'Connected' : 'Disconnected'}
          </div>
          
          <div className="scene-selector">
            <button 
              onClick={() => changeScene('highway')}
              className={currentScene === 'highway' ? 'active' : ''}
            >
              Highway
            </button>
            <button 
              onClick={() => changeScene('parking_lot')}
              className={currentScene === 'parking_lot' ? 'active' : ''}
            >
              Parking Lot
            </button>
            <button 
              onClick={() => changeScene('intersection')}
              className={currentScene === 'intersection' ? 'active' : ''}
            >
              Intersection
            </button>
          </div>
          
          <div className="status-panel">
            <div>Speed: {Math.abs(carState.speed).toFixed(2)} px/s</div>
            <div>Direction: {carState.direction.toFixed(1)}°</div>
            <div>Gear: {carState.gear}</div>
            <div>Steering: {carState.steering_angle.toFixed(1)}°</div>
            <div>Accel Level: {getAccelerationLevelDisplay()}</div>
            <div>Signals: {leftSignalOn ? '← ' : ''}{rightSignalOn ? '→' : ''}</div>
            
            {/* Display drive duration in highway scene */}
            {currentScene === 'highway' && (
              <div>
                <div>Drive Time: {driveDuration} seconds</div>
                <div>Distance: {distanceTraveled.toFixed(0)} px</div>
              </div>
            )}
          </div>
          
          <div className="controls-help">
            <h3>Controls:</h3>
            <p>↑: Accelerate (multiple levels)</p>
            <p>↓: Brake (multiple levels)</p>
            <p>←/→: Steer</p>
            <p>Q: Left Turn Signal</p>
            <p>E: Right Turn Signal</p>
            <p>Space: Hazard Lights</p>
            <p>D: Drive</p>
            <p>R: Reverse</p>
            <p>P: Park</p>
          </div>
          
          {/* Add on-screen controls for mobile/touch devices */}
          <div className="touch-controls">
            <button id="accelerate-btn" className="control-btn accelerate">▲</button>
            <button id="brake-btn" className="control-btn brake">▼</button>
            <button id="steer-left-btn" className="control-btn steer-left">◀</button>
            <button id="steer-right-btn" className="control-btn steer-right">▶</button>
          </div>
          
          {/* Add turn signal controls */}
          <div className="signal-controls">
            <button onClick={toggleLeftSignal} className={leftSignalOn ? 'active' : ''}>◀ Signal</button>
            <button onClick={toggleHazardLights} className={(leftSignalOn && rightSignalOn) ? 'active' : ''}>Hazard</button>
            <button onClick={toggleRightSignal} className={rightSignalOn ? 'active' : ''}>Signal ▶</button>
          </div>
          
          <div className="gear-controls">
            <button onClick={() => socket && socket.isConnected && socket.sendControls({ gear: 'P' })} 
              className={carState.gear === 'P' ? 'active' : ''}>P</button>
            <button onClick={() => socket && socket.isConnected && socket.sendControls({ gear: 'D' })}
              className={carState.gear === 'D' ? 'active' : ''}>D</button>
            <button onClick={() => socket && socket.isConnected && socket.sendControls({ gear: 'R' })}
              className={carState.gear === 'R' ? 'active' : ''}>R</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;