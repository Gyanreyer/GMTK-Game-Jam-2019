import * as PIXI from "pixi.js";
import Vector from "victor";
import gameManager, {
  APP_STATES,
  CENTER_POINT,
  DISPLAY_SIZE
} from "../managers/GameManager.js";

const FRICTION = 0.06;
const FORCE_AMOUNT = 30;
const ANGLE_ROTATION_AMOUNT = -1;
const PLAYER_COLOR = 0xa9e5bb;
const ARROW_COLOR = 0xf7b32b;
export const PLAYER_RADIUS = 25;

class Player {
  constructor() {
    this.container = new PIXI.Container();
    this.graphics = new PIXI.Graphics();

    this.container.addChild(this.graphics);

    gameManager.app.stage.addChild(this.container);

    gameManager.app.ticker.add(this.update.bind(this));

    this.position = new Vector(CENTER_POINT, CENTER_POINT);
    this.velocity = new Vector(0, 0);
    this.isKeyDown = false;
    this.angle = 0;

    window.addEventListener("keydown", this.onKeyDown.bind(this));
    window.addEventListener("keyup", this.onKeyUp.bind(this));
  }

  onKeyDown(event) {
    if (!this.isKeyDown && (event.key === " " || event.keyCode === 32)) {
      if (gameManager.state !== APP_STATES.PLAYING) {
        // If the game isn't playing, start it when the user hits the space bar
        gameManager.startGame();
      }
      // Indicate that the key is pressed
      this.isKeyDown = true;
      // Slow down the game's playback speed to create a slow-mo effect
      gameManager.app.ticker.speed = 0.05;
    }
  }

  onKeyUp(event) {
    if (this.isKeyDown && (event.key === " " || event.keyCode === 32)) {
      // Indicate that the key is no longer pressed
      this.isKeyDown = false;
      // Launch the player in whatever the arrow's direction is pointing
      this.applyForceInDirection();
      // Resume playing at full speed
      gameManager.app.ticker.speed = 1;
    }
  }

  applyForceInDirection() {
    // Set the velocity based on the current rotation angle so the player
    // will get launched that way
    this.velocity = new Vector(
      Math.cos(this.angle),
      Math.sin(this.angle)
    ).multiplyScalar(FORCE_AMOUNT);
  }

  update(delta) {
    if (gameManager.state !== APP_STATES.PLAYING) {
      return;
    }

    if (this.isKeyDown) {
      // Continue to spin the rotation angle around until the player releases
      // the spacebar
      this.angle += ANGLE_ROTATION_AMOUNT * delta;
    }

    const velocityLengthSq = this.velocity.lengthSq();

    // Stretch the player a little bit to make our velocity feel
    // more weighty
    const scaleStretchAmount = (velocityLengthSq * delta) / 750;

    this.container.scale.set(
      1 + scaleStretchAmount,
      1 - scaleStretchAmount * 0.1
    );

    if (velocityLengthSq > 0) {
      const velocityMoveVector = this.velocity.clone().multiplyScalar(delta);
      this.position.add(velocityMoveVector);

      // If the player goes outside the bounds of the play area,
      // make them bounce off the wall
      if (this.position.x < PLAYER_RADIUS) {
        this.position.x = PLAYER_RADIUS;
        this.velocity.multiplyScalarX(-0.95);
        this.angle = this.velocity.angle();
      } else if (this.position.x > DISPLAY_SIZE - PLAYER_RADIUS) {
        this.position.x = DISPLAY_SIZE - PLAYER_RADIUS;
        this.velocity.multiplyScalarX(-0.95);
        this.angle = this.velocity.angle();
      }
      if (this.position.y < PLAYER_RADIUS) {
        this.position.y = PLAYER_RADIUS;
        this.velocity.multiplyScalarY(-0.95);
        this.angle = this.velocity.angle();
      } else if (this.position.y > DISPLAY_SIZE - PLAYER_RADIUS) {
        this.position.y = DISPLAY_SIZE - PLAYER_RADIUS;
        this.velocity.multiplyScalarY(-0.95);
        this.angle = this.velocity.angle();
      }

      // Apply a friction force to slow down the player over time
      const frictionForce = velocityMoveVector.multiplyScalar(FRICTION);
      this.velocity.subtract(frictionForce);

      // If the velocity drops below a certain threshold, just stop it completely
      if (this.velocity.lengthSq() < 0.005) {
        this.velocity.multiplyScalar(0);
      }
    }

    this.render();
  }

  drawPlayerCircle() {
    this.graphics.beginFill(PLAYER_COLOR);
    this.graphics.drawCircle(0, 0, PLAYER_RADIUS);
    this.graphics.endFill();
  }

  drawDirectionArrow() {
    this.graphics.beginFill(ARROW_COLOR);

    this.graphics.moveTo(PLAYER_RADIUS + 7, 0);
    this.graphics.lineTo(PLAYER_RADIUS + 5, -8);
    this.graphics.lineTo(PLAYER_RADIUS + 120, 0);
    this.graphics.lineTo(PLAYER_RADIUS + 5, 8);
    this.graphics.closePath();
    this.graphics.endFill();
  }

  render() {
    this.graphics.clear();

    this.drawPlayerCircle();

    if (this.isKeyDown) {
      // Draw a direction arrow while the user has the spacebar held
      this.drawDirectionArrow();
    }

    this.container.position.set(this.position.x, this.position.y);
    this.container.rotation = this.angle;
  }
}

export default new Player();
