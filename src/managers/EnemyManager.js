import Enemy from "../entities/Enemy.js";
import gameManager, { APP_STATES } from "../managers/GameManager.js";

class EnemyManager {
  constructor() {
    this.enemies = [];
    gameManager.app.ticker.add(this.update.bind(this));
  }

  spawnEnemy() {
    this.enemies.push(new Enemy());
  }

  update(delta) {
    if (
      this.lastGameState !== APP_STATES.PLAYING &&
      gameManager.state === APP_STATES.PLAYING
    ) {
      // If the game has just started after previously having been in either
      // the start or game over state, make sure everything is reset

      // We will start with spawning enemies on an interval of 1 every 2 seconds,
      // and this will gradually decrease as the game progresses so that enemies
      // begin spawning more and more frequently
      this.spawnInterval = 2;
      // We will wait 0.5s before we spawn the very first enemy
      this.spawnTimer = 0.5;

      if (this.enemies.length) {
        // If there are enemies left over from a previous game,
        // clean up and delete them
        for (let i = this.enemies.length - 1; i >= 0; i--) {
          const enemy = this.enemies[i];
          enemy.graphics.destroy();
          enemy.container.destroy();
        }

        this.enemies.length = 0;
      }
      this.lastGameState = gameManager.state;
      return;
    } else {
      this.lastGameState = gameManager.state;

      if (gameManager.state !== APP_STATES.PLAYING) {
        return;
      }
    }

    this.spawnTimer -= delta / 60;

    if (this.spawnTimer <= 0) {
      // If the spawn timer has run out, spawn a new enemy and slightly decrease
      // the spawn interval so the next enemy will come a little faster
      this.spawnEnemy();
      this.spawnTimer = this.spawnInterval;
      this.spawnInterval = Math.max(this.spawnInterval * 0.98, 0.2);
    }

    // Iterating in reverse order so it's easier to deal with deleting enemies from the array
    // when they go out of bounds
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];

      if (enemy.isOutOfBounds()) {
        // Clean up after an enemy when it goes out of bounds
        enemy.graphics.destroy();
        enemy.container.destroy();
        delete this.enemies[i];
        this.enemies.splice(i, 1);
      } else {
        enemy.update(delta);

        if (enemy.checkForCollisionWithPlayer()) {
          // If an enemy collides with the player, end the game
          gameManager.endGame();
          break;
        }
      }
    }

    this.render();
  }

  render() {
    for (let i = 0, numEnemies = this.enemies.length; i < numEnemies; i++) {
      this.enemies[i].render();
    }
  }
}

export default new EnemyManager();
