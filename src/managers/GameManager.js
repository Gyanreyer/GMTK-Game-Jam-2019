import * as PIXI from "pixi.js";

export const APP_STATES = {
  START: "start",
  PLAYING: "playing",
  GAME_OVER: "game_over"
};

export const DISPLAY_SIZE = 1080;
export const CENTER_POINT = DISPLAY_SIZE / 2;

class GameManager {
  constructor() {
    // Create our pixi app
    this.app = new PIXI.Application({
      width: DISPLAY_SIZE,
      height: DISPLAY_SIZE,
      antialias: true,
      backgroundColor: 0xfcf6b1
    });

    const { view } = this.app;

    // Append the canvas for our app to the page
    view.style.margin = "0 auto";
    view.style.maxHeight = "100vh";
    view.style.maxWidth = "100vw";
    view.style.display = "block";
    document.body.appendChild(view);

    this.state = APP_STATES.START;

    this.timeSurvived = 0;
    this.endGame = this.endGame.bind(this);

    this.scoreText = new PIXI.Text(`Time survived: ${this.timeSurvived}`);
    this.scoreText.visible = false;
    this.app.stage.addChild(this.scoreText);

    this.startPromptContainer = new PIXI.Container();

    this.pressSpaceText = new PIXI.Text("Press and hold space to start");
    this.pressSpaceText.anchor.set(0.5, 0.5);
    this.pressSpaceText.position.set(CENTER_POINT, 500);
    this.startPromptContainer.addChild(this.pressSpaceText);

    this.finalScoreText = new PIXI.Text("You survived for 0 seconds", {
      fontSize: 48
    });
    this.finalScoreText.anchor.set(0.5, 0.5);
    this.finalScoreText.position.set(CENTER_POINT, 400);
    this.finalScoreText.visible = false;
    this.startPromptContainer.addChild(this.finalScoreText);

    this.app.stage.addChild(this.startPromptContainer);

    this.app.ticker.add(this.update.bind(this));
  }

  startGame() {
    this.state = APP_STATES.PLAYING;
    this.timeSurvived = 0;

    this.scoreText.visible = true;
    this.app.stage.removeChild(this.startPromptContainer);
  }

  endGame() {
    this.state = APP_STATES.GAME_OVER;
    this.scoreText.visible = false;
    this.finalScoreText.visible = true;
    this.finalScoreText.text = `You survived for ${this.timeSurvived.toFixed(
      2
    )} seconds`;

    this.app.stage.addChild(this.startPromptContainer);
    this.pressSpaceText.text = "Press space to restart";
  }

  update(delta) {
    if (this.state === APP_STATES.PLAYING) {
      this.timeSurvived += delta / 60;
      this.scoreText.text = `Time survived: ${this.timeSurvived.toFixed(2)}`;
    } else if (this.state === APP_STATES.GAME_OVER) {
    }
  }
}

export default new GameManager();
