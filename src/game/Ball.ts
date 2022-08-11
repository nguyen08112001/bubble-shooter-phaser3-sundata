import Phaser from "phaser";
import BallColor from "./BallColor";
import TextureKeys from "~/consts/TextureKeys";

const ALL_COLORS = [BallColor.Red, BallColor.Green, BallColor.Yellow];

const DPR = window.devicePixelRatio;

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
    getScale(): number;
  }
}

export default class Ball
  extends Phaser.Physics.Arcade.Sprite
  implements IBall
{
  private _color = BallColor.Red;
  private _scale = DPR / 5;
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
    this.setScale(this._scale);
    this.setRandomColor();
  }

  getScale() {
    return this._scale;
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
    console.log(this.radius, this.physicsRadius);
    this.setCircle(usedRadius, diff, diff);

    return this;
  }

  launch(direction: Phaser.Math.Vector2) {
    const DPR = window.devicePixelRatio;
    const speed = 1000 * DPR;
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
        lifespan: 500,
        speedX: { min: -100, max: 100 },
        speedY: { min: -100, max: 100 },
        quantity: 10,
        scale: { start: 0.5, end: 0, ease: "Power2" },
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
