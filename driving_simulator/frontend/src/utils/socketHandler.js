/**
 * WebSocket handler for the driving simulator
 * Updated to handle analog acceleration values
 */
class SocketHandler {
  constructor(url = 'ws://localhost:8765') {
    this.url = url;
    this.socket = null;
    this.isConnected = false;
    this.reconnectTimeout = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 2000; // 2 seconds initial delay

    // Custom callbacks for state updates
    this.onStateUpdate = (car, scene) => {};
    this.onSceneChanged = (scene) => {};
    this.onError = (error) => {};
  }

  /**
   * Connect to the WebSocket server
   */
  connect() {
    console.log(`Connecting to ${this.url}...`);
    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      console.log('WebSocket connection established');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Request initial state from the server
      this.socket.send(JSON.stringify({
        type: 'request_state'
      }));
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (e) {
        console.error('Error parsing message:', e);
      }
    };

    this.socket.onclose = (event) => {
      this.isConnected = false;
      console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
      this.handleReconnect();
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.onError(error);
    };
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    this.isConnected = false;
    console.log('WebSocket disconnected');
  }

  /**
   * Handle reconnection attempts
   */
  handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      return;
    }
    
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1);
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Handle incoming messages
   * @param {Object} data - The parsed message data
   */
  handleMessage(data) {
    if (data.type === 'state_update') {
      this.onStateUpdate(data.car, data.scene);
    } else if (data.type === 'scene_changed') {
      this.onSceneChanged(data.scene);
    }
  }

  // /**
  //  * Send control commands to the server
  //  * @param {Object} controls - The control values to send
  //  */
  // sendControls(controls) {
  //   if (!this.isConnected) {
  //     console.warn('Cannot send controls: not connected');
  //     return false;
  //   }
    
  //   try {
  //     this.socket.send(JSON.stringify({
  //       type: 'manual_control',
  //       controls: controls
  //     }));
  //     return true;
  //   } catch (e) {
  //     console.error('Error sending controls:', e);
  //     return false;
  //   }
  // }

  /**
   * Set the current scene
   * @param {string} scene - The scene name ('highway', 'parking_lot', or 'intersection')
   */
  setScene(scene) {
    if (!this.isConnected) {
      console.warn('Cannot change scene: not connected');
      return false;
    }
    
    if (!['highway', 'parking_lot', 'intersection'].includes(scene)) {
      console.error('Invalid scene:', scene);
      return false;
    }
    
    try {
      this.socket.send(JSON.stringify({
        type: 'set_scene',
        scene: scene
      }));
      return true;
    } catch (e) {
      console.error('Error setting scene:', e);
      return false;
    }
  }
}

export default SocketHandler;