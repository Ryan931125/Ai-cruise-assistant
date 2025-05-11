import React, { useState, useEffect } from 'react';
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
    turn_signal: "N"
  });
  
  const [currentScene, setCurrentScene] = useState('highway');
  const [socketConnected, setSocketConnected] = useState(false);
  const [socket, setSocket] = useState(null);
  
  // Independent turn signal states
  const [leftSignalOn, setLeftSignalOn] = useState(false);
  const [rightSignalOn, setRightSignalOn] = useState(false);

  
  
  // Initialize socket connection
  useEffect(() => {
    const socketHandler = new SocketHandler('ws://localhost:8765');
    
    socketHandler.onStateUpdate = (car, scene) => {
      setCarState(car);
      setCurrentScene(scene);
      
  
    };
    
    socketHandler.onSceneChanged = (scene) => {
      setCurrentScene(scene);
    };
    
    socketHandler.connect();
    setSocket(socketHandler);
    
    return () => {
      socketHandler.disconnect();
    };
  }, []);
  
  // get data from socket (Arduino)
  // useEffect(() => {
  //   if (carState.turning_signal === "L"){
  //     setLeftSignalOn(true);
  //     setRightSignalOn(false);
  //   } else if(carState.turning_signal === "R") {
  //     setLeftSignalOn(false);
  //     setRightSignalOn(true);
  //   } else {
  //     setLeftSignalOn(false);
  //     setRightSignalOn(false);
  //   }
  //   console.log("turning signal: ", carState.turning_signal)

  // }, [carState.turning_signal]);

  // useEffect(()=>{
  //   setCurrentAccelLevel(carState.acceleration_rate);
  //   setCurrentBrakeLevel(carState.deceleration_rate);
  //   setCurrentScene(carState.scene);
  //   // socket.sendControls({steering_angle: carState.steering_angle});
  // },[carState.acceleration_rate, carState.deceleration_rate, carState.scene, carState.steering_angle]);



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
  
  useEffect(() =>{

    setLeftSignalOn((carState.turn_signal === "L" ?true:false));
    setRightSignalOn((carState.turn_signal === "R" ?true:false));
  }, [carState.turn_signal]
  );
  
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
            <div>Accel: {carState.acceleration_rate.toFixed(1)}</div>
            <div>Dece: {carState.deceleration_rate.toFixed(1)}</div>
            <div>Gear: {carState.gear}</div>
            <div>Steering: {carState.steering_angle.toFixed(1)}°</div>
            <div>Signals: {carState.turn_signal}</div>
            
          </div>
         
          
        </div>
      </div>
    </div>
  );
}

export default App;