import Phaser from "phaser";
import Ball from "./Ball";

declare global {
  interface IDynamicBallPool extends Phaser.Physics.Arcade.Group {
    spawn(x: number, y: number): IBall;
    despawn(ball: IBall);
  }
}

export default class DynamicBallPool
  extends Phaser.Physics.Arcade.Group
  implements IDynamicBallPool
{
  private texture: string;

  constructor(
    world: Phaser.Physics.Arcade.World,
    scene: Phaser.Scene,
    texture: string,
    config:
      | Phaser.Types.Physics.Arcade.PhysicsGroupConfig
      | Phaser.Types.GameObjects.Group.GroupCreateConfig = {}
  ) {
    const defaults:
      | Phaser.Types.Physics.Arcade.PhysicsGroupConfig
      | Phaser.Types.GameObjects.Group.GroupCreateConfig = {
      classType: Ball,
      maxSize: -1,
      key: texture,
      frame: 0,
      active: false,
      visible: false,
      frameQuantity: 4,
      runChildUpdate: true
    };

    super(world, scene, Object.assign(defaults, config));
    this.active = true
    this.texture = texture;

    this.scene.game.events.on("ball-over-scene", (ball) => {
        console.log("ball-over-scene")
        this.despawn(ball)
    })
  }

  spawn(x: number, y: number) {
    const spawnExisting = this.countActive(false) > 0;

    const ball: IBall = this.get(x, y, this.texture);

    if (!ball) {
      return ball;
    }

    ball.setScale(ball.getScale());

    ball.useSmallCircleCollider();

    ball.emit("on-spawned");

    if (spawnExisting) {
        const body = ball.body as Phaser.Physics.Arcade.Body;
        ball.setVisible(true);
        ball.setActive(true);
        this.world.add(body);
        body.enable = true
        ball.setRandomColor();
        body.allowGravity = false;
        body.setImmovable(true)
    }

    ball.setRandomColor();

    return ball;
  }

  despawn(ball: IBall) {
    this.killAndHide(ball);
    ball.body.enable = false
    this.world.remove(ball.body);
    ball.alpha = 1;
    ball.body.reset(0, 0);
  }
}

Phaser.GameObjects.GameObjectFactory.register(
  "dynamicBallPool",
  function (
    texture: string,
    config:
      | Phaser.Types.Physics.Arcade.PhysicsGroupConfig
      | Phaser.Types.GameObjects.Group.GroupCreateConfig = {}
  ) {
    // @ts-ignore
    const pool = new DynamicBallPool(
      // @ts-ignore
      this.scene.physics.world,
      // @ts-ignore
      this.scene,
      texture,
      config
    );

    // @ts-ignore
    this.updateList.add(pool);

    return pool;
  }
);
