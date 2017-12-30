import React from 'react';
import _ from 'lodash';
import './App.css';

const Title = props => <div className="title">{props.title}</div>;
const Steps = props => <div className="display inline">{props.steps}</div>;

const ToggleStart = props => (
  <div className="start inline" onClick={() => props.onClick()}>
    {props.start}
  </div>
);

const ToggleStrict = props => (
  <div className="strict inline" onClick={() => props.onClick()}>
    {props.strict == false ? 'Easy' : 'Strict'}
  </div>
);

class Pad extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      colorsequence: this.props.gameSequence,
      activeClass: 'pad ' + this.props.color,
      colorreset: false
    };

    this.url = this.props.source;
    this.audio = new Audio(this.url);
    this.togglePlay = this.togglePlay.bind(this);
  }

  componentWillUnmount() {
    this.props.onRef(undefined);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.activeClass.split(' ').length > 2 && !this.state.colorrest) {
      setTimeout(() => {
        this.restoreStyle();
      }, 300);
    }
  }

  togglePlay() {
    this.audio.play();
  }

  clickDiv(el) {
    el.click();
  }

  mouseDownHandler(e) {
    console.log(e); //e is sysnthetic event instance

    this.clickhandler(e);
    this.setState({ colorreset: true });
  }

  clickhandler(e) {
    let stateArray = this.state.activeClass.split(' ');
    stateArray[1] = stateArray[1] + ' ' + stateArray[1] + '-isactive';
    this.setState({ activeClass: stateArray.join(' ') });
    this.audio.play();

    console.log(e); //e is sysnthetic event instance
  }
  restoreStyle = () => {
    let origstate = this.state.activeClass.split(' ');
    if (origstate.length > 2) origstate.pop();
    this.setState({ activeClass: origstate.join(' ') });
    this.setState({ colorreset: false });
  };
  render() {
    return (
      <div
        id={this.props.id}
        className={this.state.activeClass}
        onMouseDown={this.togglePlay}
        onClick={() => this.props.onClick(this.props.id)}
      />
    );
  }
}

const Switches = props => {
  let stateStyle = {
    width: '30px',
    height: '30px',
    backgroundColor: '#000000'
  };
  let statebStyle = {
    width: '30px',
    height: '30px',
    backgroundColor: '#3193de'
  };
  //Recieves 2(onclick function and state on or off) props on click to toggle on off state, on off state contain colors that are interchanged based on state
  return (
    <div className="switchContainer">
      {props.gameState == true ? (
        <div className="gamestate">
          <p className="off inline">OFF</p>
          <div style={statebStyle} onClick={() => props.onClick()} />
          <div style={stateStyle} onClick={() => props.onClick()} />
          <p className="on inline">ON</p>
        </div>
      ) : (
        <div className="gamestate">
          <p className="off inline">OFF</p>
          <div style={stateStyle} onClick={() => props.onClick()} />
          <div style={statebStyle} onClick={() => props.onClick()} />
          <p className="on inline">ON</p>
        </div>
      )}
    </div>
  );
};

function getNewGameStep(params) {
  return Math.floor(Math.random() * 3 + 0);
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.createPadItems = this.createPadItems.bind(this);
    this.showNewState = this.showNewState.bind(this);
    this.playNewStateSound = this.playNewStateSound.bind(this);
    this.sleep = this.sleep.bind(this);
    this.compareAndUpdateState = this.compareAndUpdateState.bind(this);
    this.handleError = this.handleError.bind(this);
  }

  state = {
    on: false,
    start: false,
    strict: false,
    steps: 0,
    error: false,
    gameSequence: [],
    inputSequence: [],
    gameSpeed: 1700
  };

  sleep = function(ms) {
    return new Promise(res => setTimeout(res, ms));
  };

  playNewStateSound = async function(context, x) {
    console.log('sleep for ' + x, new Date());
    await this.sleep(1000);
    console.log('awoke for ' + x, new Date());
    context.mouseDownHandler();
  };

  compareAndUpdateState = async function() {
    console.log('sleep for new State', new Date());
    await this.sleep(2000);
    console.log('wake for new State', new Date());
    if (this.state.inputSequence.length < this.state.gameSequence.length) return;
    if (this.state.inputSequence.length > this.state.gameSequence.length) this.handleError();
    let equal =
      this.state.inputSequence.length == this.state.gameSequence.length &&
      this.state.inputSequence.every((element, index) => parseInt(element) === this.state.gameSequence[index]);
    if (equal) {
      this.setState(
        prevState => {
          if (prevState.gameSequence.length == 6) {
            return {
              gameSequence: [...prevState.gameSequence, getNewGameStep()],
              steps: prevState.steps + 1,
              inputSequence: [],
              gameSpeed: 1000
            };
          } else if (prevState.gameSequence.length == 12) {
            return {
              gameSequence: [...prevState.gameSequence, getNewGameStep()],
              steps: prevState.steps + 1,
              inputSequence: [],
              gameSpeed: 500
            };
          }
          return {
            gameSequence: [...prevState.gameSequence, getNewGameStep()],
            steps: prevState.steps + 1,
            inputSequence: []
          };
        },
        () => this.showNewState()
      );
    } else {
      this.handleError();
    }
  };
  handleError = async function() {
    if (this.state.strict) {
      this.setState({ error: true, inputSequence: [] }, () => this.setInitialState());
    } else {
      this.setState({ error: true });
      await this.sleep(250);
      this.setState({ error: false, inputSequence: [] }, () => this.showNewState());
    }
  };
  showNewState = async function() {
    for (let i = 0; i < this.state.steps; i++)
      switch (this.state.gameSequence[i]) {
        case 0:
          let x = this.state.gameSequence[i];
          let context = this.pad_0;

          this.playNewStateSound(context, x);
          await this.sleep(this.state.gameSpeed);
          break;
        case 1:
          context = this.pad_1;
          x = this.state.gameSequence[i];
          this.playNewStateSound(context, x);
          await this.sleep(this.state.gameSpeed);
          break;
        case 2:
          x = this.state.gameSequence[i];
          context = this.pad_2;
          this.playNewStateSound(context, x);
          await this.sleep(this.state.gameSpeed);
          break;
        case 3:
          x = this.state.gameSequence[i];
          this.playNewStateSound(context, x);
          await this.sleep(this.state.gameSpeed);
        default:
          break;
      }
  };

  setInitialState = () => {
    this.setState(
      {
        gameSequence: [getNewGameStep()],
        inputSequence: [],
        steps: 1,
        error: false,
        start: true,
        gameSpeed: 2000
      },
      () => this.showNewState()
    );
  };

  stopGame = () => {
    this.setState({
      gameSequence: [],
      on: false,
      start: false,
      strict: false
    });
  };

  handleColorClick = id => {
    this.setState(
      prevState => {
        return {
          inputSequence: prevState.inputSequence.concat(id)
        };
      },
      () => this.compareAndUpdateState()
    );
  };

  toggleOnOff = () => {
    this.setState(prevState => {
      return {
        on: !prevState.on
      };
    });
  };
  toggleStrictOnOff = () => {
    this.setState(prevState => {
      return {
        strict: !prevState.strict
      };
    });
  };
  render() {
    let colors = [
      { id: 0, color: 'green', source: 'https://s3.amazonaws.com/freecodecamp/simonSound1.mp3' },
      { id: '1', color: 'red', source: 'https://s3.amazonaws.com/freecodecamp/simonSound2.mp3' },
      { id: '2', color: 'yellow', source: 'https://s3.amazonaws.com/freecodecamp/simonSound3.mp3' },
      { id: '3', color: 'blue', source: 'https://s3.amazonaws.com/freecodecamp/simonSound4.mp3' }
    ];
    return (
      <div className="simonBoard">
        {colors.map(item => this.createPadItems(item.color, item.id, item.source))}

        <div className="controls">
          <Title title="SIMON" />
          <Steps steps={!this.state.start ? '--' : [!this.state.error ? this.state.steps : '!!']} />
          <ToggleStart start="Start" onClick={() => this.setInitialState()} />
          <ToggleStrict strict={this.state.strict} onClick={() => this.toggleStrictOnOff()} />
          <Switches gameState={this.state.on} onClick={() => this.toggleOnOff()} />
        </div>
      </div>
    );
  }
  createPadItems(color, id, source) {
    return (
      <Pad
        ref={pad => {
          this['pad_' + id] = pad;
        }}
        color={color}
        id={id}
        key={id}
        source={source}
        onClick={() => this.handleColorClick(id)}
      />
    );
  }
}

export default App;
