import Phaser from "phaser";
import BallColor from "./BallColor";
import TextureKeys from "~/consts/TextureKeys";

const ALL_COLORS = [
  BallColor.Red,
  BallColor.Grey,
  BallColor.Green,
  BallColor.Yellow,
];

declare global {
  interface IBall extends Phaser.Physics.Arcade.Sprite {
    readonly color: BallColor;
    readonly radius: number;
    readonly physicsRadius: number;
    readonly emitter: Phaser.GameObjects.Particles.ParticleEmitter | undefined;

    setRandomColor(): IBall;
    setColor(color: BallColor): IBall;
    useCircleCollider(): IBall;
    launch(direction: Phaser.Math.Vector2): void;
  }
}

export default class Ball
  extends Phaser.Physics.Arcade.Sprite
  implements IBall
{
  private _color = BallColor.Red;
  private _emitter: Phaser.GameObjects.Particles.ParticleEmitter | undefined;

  get color() {
    return this._color;
  }

  get radius() {
    return this.width * 0.5;
  }

  get physicsRadius() {
    return this.radius * 0.6;
  }

  get emitter() {
    return this._emitter;
  }

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    frame: string = ""
  ) {
    super(scene, x, y, texture, frame);
    this.setRandomColor();
  }

  setRandomColor() {
    const r = Phaser.Math.Between(0, ALL_COLORS.length - 1);
    return this.setColor(ALL_COLORS[r]);
  }

  setColor(color: BallColor) {
    this._color = color;
    switch (color) {
      case BallColor.Red:
        this.setTexture(TextureKeys.VirusRed);
        break;

      case BallColor.Green:
        this.setTexture(TextureKeys.VirusGreen);
        break;

      case BallColor.Grey:
        this.setTexture(TextureKeys.VirusBlue);
        break;

      case BallColor.Yellow:
        this.setTexture(TextureKeys.VirusYellow);
        break;
    }

    return this;
  }

  useCircleCollider() {
    const radius = this.radius;
    const usedRadius = this.physicsRadius;
    const diff = radius - usedRadius;
    this.setCircle(usedRadius, diff, diff);

    return this;
  }

  launch(direction: Phaser.Math.Vector2, speed = 5000) {
    this.setCollideWorldBounds(true, 1, 1);

    this.body.x = this.x;
    this.body.y = this.y;

    this.body.enable = true;

    this.setVelocity(direction.x * speed, direction.y * speed);

    this.createParticlesEmitter();
  }

  private createParticlesEmitter() {
    // if (this._emitter) return;
    this._emitter = this.scene.add
      .particles(TextureKeys.FlareParticles)
      .setDepth(2000)
      .createEmitter({
        frame: ["white"],
        radial: false,
        lifespan: 1000,
        speedX: { min: -1000, max: 1000 },
        // quantity: 2,
        maxParticles: 100,
        scale: { start: 1, end: 0, ease: "Power3" },
        blendMode: "ADD",
        tint: this.color,
        follow: this,
      });
  }
}

Phaser.GameObjects.GameObjectFactory.register(
  "ball",
  function (x: number, y: number, texture: string, frame: string = "") {
    // @ts-ignore
    var ball = new Ball(this.scene, x, y, texture, frame);

    // @ts-ignore
    this.displayList.add(ball);
    // @ts-ignore
    this.updateList.add(ball);
    // @ts-ignore
    this.scene.physics.world.enableBody(
      ball,
      Phaser.Physics.Arcade.DYNAMIC_BODY
    );

    ball.setCircle(ball.width * 0.5);

    return ball;
  }
);
