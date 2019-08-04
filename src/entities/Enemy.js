import * as PIXI from "pixi.js";
import Vector from "victor";

// The player entity so we can spawn the enemy based on the player's position
import player, {PLAYER_RADIUS} from "../entities/Player.js";
import gameManager, { DISPLAY_SIZE } from "../managers/GameManager.js";

const ENEMY_COLOR = 0xf72c25;
const SPAWN_AREA_PADDING = 20;
const MOVE_SPEED = 10;

const ENEMY_STATES = {
  SPAWNING: "spawning",
  TRACKING: "tracking",
  LAUNCHING: "launching",
  ATTACKING: "attacking"
};

const topLeftBound = new Vector(SPAWN_AREA_PADDING, SPAWN_AREA_PADDING);
const bottomRightBound = new Vector(
  DISPLAY_SIZE - SPAWN_AREA_PADDING,
  DISPLAY_SIZE - SPAWN_AREA_PADDING
);

export default class Enemy {
  constructor() {
    this.state = ENEMY_STATES.SPAWNING;
    this.stateTimer = 0;

    this.position = this.getSpawnPosition();

    this.container = new PIXI.Container();
    this.graphics = new PIXI.Graphics();
    this.container.addChild(this.graphics);
    gameManager.app.stage.addChild(this.container);
  }

  getSpawnPosition() {
    // Pick a random position in the play area
    const spawnPosition = new Vector().randomize(
      topLeftBound,
      bottomRightBound
    );

    // If the random position is invalid because it's too close to the
    // player, recursively try again until we get something that works
    if (
      spawnPosition.distanceSq(player.position) <
      16 * PLAYER_RADIUS * PLAYER_RADIUS
    ) {
      return this.getSpawnPosition();
    }

    return spawnPosition;
  }

  // Check if this enemy is outside of the view so that it can be deleted
  isOutOfBounds() {
    return (
      this.position.x < -100 ||
      this.position.x > DISPLAY_SIZE + 100 ||
      this.position.y < -100 ||
      this.position.y > DISPLAY_SIZE + 100
    );
  }

  // Update the enemy's direction so it's facing the platyer
  updateTrackingDirection() {
    this.direction = player.position
      .clone()
      .subtract(this.position)
      .normalize();
  }

  checkForCollisionWithPlayer() {
    // Check for collision with player
    return (
      this.state === ENEMY_STATES.ATTACKING &&
      player.position.distanceSq(this.position) < 1600
    );
  }

  update(delta) {
    this.stateTimer += delta / 60;

    switch (this.state) {
      case ENEMY_STATES.SPAWNING:
        // Enemies will fade in for 0.25s when they first spawn
        this.updateTrackingDirection();
        this.opacity = this.stateTimer * 2;

        if (this.stateTimer >= 0.25) {
          // After 0.25s seconds have elapsed, switch to tracking mode
          this.state = ENEMY_STATES.TRACKING;
          this.stateTimer = 0;
        }
        break;
      case ENEMY_STATES.TRACKING:
        // Enemies will sit idly for 1s and track the player's position without
        // being a threat yet
        this.updateTrackingDirection();
        if (this.stateTimer >= 1) {
          // After 1 second has elapsed, switch to launching mode
          this.state = ENEMY_STATES.LAUNCHING;
          this.stateTimer = 0;
        }
        break;
      case ENEMY_STATES.LAUNCHING:
        // Enemies will fully fade in and shift backward a little bit over 0.25s before launching
        // to give the player visual confirmation that they are about to be a threat
        this.opacity = Math.min(0.5 + this.stateTimer * 2, 1);
        this.position.add(
          this.direction.clone().multiplyScalar(
            // Will shift back by 15 units before launching at the player
            -this.stateTimer * 15 * delta
          )
        );
        if (this.stateTimer >= 0.25) {
          // After 0.25s have elapsed, switch to attacking mode
          this.state = ENEMY_STATES.ATTACKING;
          this.stateTimer = 0;
        }
        break;
      case ENEMY_STATES.ATTACKING:
        // Enemies will accelerate in a straight line in whatever their direction was locked into when they
        // started launching
        const moveSpeed = Math.min(
          // Will accelerate to full speed in 0.5 seconds
          (this.stateTimer / 0.5) * MOVE_SPEED,
          MOVE_SPEED
        );
        // Tweak the enemy's scale a little bit so it stretches based on its velocity
        // to give a more weighty impression of speed
        this.container.scale.set(1 + moveSpeed / 50, 1 - moveSpeed / 100);
        this.position.add(
          this.direction.clone().multiplyScalar(moveSpeed * delta)
        );
        break;
    }
  }

  render() {
    this.graphics.clear();
    this.graphics.beginFill(ENEMY_COLOR, this.opacity);
    this.graphics.moveTo(15, 0);
    this.graphics.lineTo(-25, -20);
    this.graphics.lineTo(-25, 20);
    this.graphics.closePath();
    this.graphics.endFill();

    this.container.position.set(this.position.x, this.position.y);
    this.container.rotation = this.direction.angle();
  }
}
