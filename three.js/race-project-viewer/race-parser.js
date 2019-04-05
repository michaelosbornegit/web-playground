// The parser that parses race information

class RaceParser {

  view;

  constructor(view) {
    this.view = view;
  }

  parseMessage(message) {
    let messageJSON = JSON.parse(message);

    console.log(messageJSON);
    switch(messageJSON.type) {
      case 'RaceInfo':
        this.view.loadRaceInfo(messageJSON.obj);
        break;
      case 'ParticipantBox':
        this.view.loadParticipants(messageJSON.obj);
        break;
    }
  }

}
