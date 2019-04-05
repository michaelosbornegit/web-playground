// This project is an extension of a Java WebSocket project where race data is
// streamed to clients, but this is going to interpret the race data and provide
// a nice display in the browser.

class RaceViewer {

  constructor() {
    // initialize parts of the program
    this.view = new RaceView();
    this.parser = new RaceParser(this.view);

    // attempt to make connection to server
    this.setUpWebSocketConnection();


  }

  setUpWebSocketConnection() {
    // Connect to websocket
    let raceWebSocket = new WebSocket('ws://localhost:8887');

    raceWebSocket.onmessage = evt => {
      this.parser.parseMessage(evt.data);
    }
  }
}

// kick the program off
let rv = new RaceViewer();
