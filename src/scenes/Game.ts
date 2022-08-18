import Phaser from "phaser";

import TextureKeys from "~/consts/TextureKeys";

import "~/game/Shooter";
import "~/game/BallPool";
import "~/game/StaticBallPool";
import "~/game/DynamicBallPool";
import BallGrid from "~/game/BallGrid";
import BallLayoutData from "~/game/BallLayoutData";
import VirusGrowthModel from "~/game/VirusGrowthModel";
import DescentController from "~/game/DescentController";
import SceneKeys from "~/consts/SceneKeys";
import ShotGuide from "~/game/guides/ShotGuide";
import SoundEffectsController from "~/game/SoundEffectsController";

const DPR = window.devicePixelRatio;

enum GameState {
  Playing,
  GameOver,
  GameWin,
}

export default class Game extends Phaser.Scene {
  private shooter?: IShooter;
  private grid?: BallGrid;

  private growthModel!: IGrowthModel;
  private descentController?: DescentController;
  private sfx?: SoundEffectsController;

  private state = GameState.Playing;
  private particles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private  staticBallPool!: IStaticBallPool;
  private  dynamicBallPool!: IDynamicBallPool;
  private  ballPool!: IBallPool;

  init() {
    this.state = GameState.Playing;
    this.growthModel = new VirusGrowthModel(500);

    this.sfx = new SoundEffectsController(this.sound);
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    this.add
      .image(width * 0.5, height * 0.5, TextureKeys.Background)
      // .setScale(DPR);
    // .setTint(0x484848);

    this.physics.world.setBounds(0, 0, width, height);
    this.physics.world.setBoundsCollision(true, true, false, false);

    this.shooter = this.add.shooter(width * 0.5, height - 30 * DPR, "");
    this.shooter.setGuide(new ShotGuide(this));

    this.ballPool = this.add.ballPool(TextureKeys.Virus);
    this.shooter.setBallPool(this.ballPool);
    this.shooter.attachBall();

    this.staticBallPool = this.add.staticBallPool(TextureKeys.Virus);

    this.dynamicBallPool = this.add.dynamicBallPool(TextureKeys.Virus);

    this.grid = new BallGrid(this, this.staticBallPool);
    this.grid.setLayoutData(new BallLayoutData(this.growthModel)).generate();

    this.physics.add.collider(
      this.ballPool,
      this.staticBallPool,
      this.handleBallHitGrid,
      this.processBallHitGrid,
      this
    );
		
		this.physics.add.collider(
      this.dynamicBallPool,
      this.dynamicBallPool
    );
    
    this.physics.add.collider(
      this.dynamicBallPool,
      this.staticBallPool
    );

    this.descentController = new DescentController(
      this,
      this.grid,
      this.growthModel
    );
    this.descentController.setStartingDescent(300);

    this.sfx?.handleShootBall(this.shooter.onShoot());
    this.sfx?.handleBallAttached(this.grid.onBallAttached());
    this.sfx?.handleClearMatches(this.grid.onBallsDestroyed());
    this.sfx?.handleClearOrphan(this.grid.onOrphanWillBeDestroyed());

    const winSub = this.growthModel.onPopulationChanged().subscribe((count) => {
      if (count > 0) {
        return;
      }
      return
      this.handleGameWin();
    });

    const ballSub = this.grid.onBallWillBeDestroyed().subscribe((ball) => {
      this.handleBallWillBeDestroyed(ball);
    });

    this.scene.run(SceneKeys.GameUI, {
      ballsDestroyed: this.grid.onBallsDestroyed(),
      ballsAdded: this.grid.onBallsAdded(),
      infectionsChanged: this.growthModel.onPopulationChanged(),
    });
    this.scene.bringToTop(SceneKeys.GameUI);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      winSub.unsubscribe();
      ballSub.unsubscribe();

      this.handleShutdown();
    });

    this.particles = this.add
      .particles(TextureKeys.VirusParticles)
      .setDepth(2000)
      .createEmitter({
        speed: { min: -500, max: 500 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.3, end: 0 },
        blendMode: Phaser.BlendModes.ADD,
        lifespan: 300,
      });
  }

  private handleGameWin() {
    // NOTE: this might not be possible...
    console.log("game win");
  }

  private handleGameOver() {
    this.scene.pause(SceneKeys.Game);
    this.scene.run(SceneKeys.GameOver);
  }

  private async handleBallWillBeDestroyed(ball: IBall) {
    const x = ball.x;
    const y = ball.y;
    const color = ball.color
    this.staticBallPool.despawn(ball);
    
    // let newBall = this.pool.spawn(x, y).setColor(color)
    // let newBall = this.add.ball(x, y, TextureKeys.VirusYellow).setColor(color)
    let newBall = this.dynamicBallPool.spawn(x, y).setColor(color)

    newBall.useCircleCollider()
    const body = newBall.body as Phaser.Physics.Arcade.Body;
    body.allowGravity = true

    newBall.setBounce(1, 1)
    newBall.setCollideWorldBounds(true, 1, 1)

    newBall.setVelocity(Phaser.Math.Between(-500, 500), 0)
  }

  private handleShutdown() {
    this.scene.stop(SceneKeys.GameUI);

    this.grid?.destroy();
    this.descentController?.destroy();
    this.sfx?.destroy();
  }

  private processBallHitGrid(
    ball: Phaser.GameObjects.GameObject,
    gridBall: Phaser.GameObjects.GameObject
  ) {
    // only accept collision if distance is close enough
    // gives a better feel for tight shots
    const b = ball as IBall;
    const gb = gridBall as IBall;

    const active = b.active && gb.active;

    if (!active) {
      return false;
    }

    const distanceSq = Phaser.Math.Distance.Squared(b.x, b.y, gb.x, gb.y);
    const minDistance = b.width * 0.9;
    const mdSq = minDistance * minDistance;

    return distanceSq <= mdSq;
  }

  private async handleBallHitGrid(
    ball: Phaser.GameObjects.GameObject,
    gridBall: Phaser.GameObjects.GameObject
  ) {
    const b = ball as IBall;
    const bx = b.x;
    const by = b.y;
    const color = b.color;

    const vx = b.body.deltaX();
    const vy = b.body.deltaY();

    const gb = gridBall as IBall;
    const gx = gb.x;
    const gy = gb.y;

    // determine direction from ball to grid
    // then negate it to have opposite direction
    const directionToGrid = new Phaser.Math.Vector2(gx - bx, gy - by)
      .normalize()
      .negate();

    // get where the ball would be at contact with grid
    const x = gx + directionToGrid.x * gb.width;
    const y = gy + directionToGrid.y * gb.width;

    this.shooter?.returnBall(b);

    this.descentController?.hold();

    await this.grid?.attachBall(x, y, color, gb, vx, vy);

    await this.descentController?.reversing();

    this.shooter?.attachBall();

    this.descentController?.descend();
  }

  update(t, dt) {

    if (this.state === GameState.GameOver || this.state === GameState.GameWin) {
      return;
    }

    if (!this.descentController || !this.shooter) {
      return;
    }

    this.growthModel.update(dt);
    this.shooter.update(dt);
    this.descentController.update(dt);

    const dcy = this.descentController.yPosition;
    if (dcy > this.shooter.y - this.shooter.radius) {
      // game over
      this.state = GameState.GameOver;
      this.handleGameOver();
    }
  }
}
