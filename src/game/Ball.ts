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
    createExplodeEffect(): void;
    setColor(color: BallColor): IBall;
    useCircleCollider(): IBall;
    useSmallCircleCollider(): IBall;
    useMediumCircleCollider(): IBall;
    updateShadowPosition(): void;
    launch(direction: Phaser.Math.Vector2): void;
    getScale(): number;
    getShadow(): Phaser.GameObjects.Image;
    reInit(): void;
  }
}

export default class Ball
  extends Phaser.Physics.Arcade.Sprite
  implements IBall
{
  body!: Phaser.Physics.Arcade.Body;
  private _color = BallColor.Red;
  private _scale = DPR / 5;
  private _emitter: Phaser.GameObjects.Particles.ParticleEmitter | undefined;
  private shadow!: Phaser.GameObjects.Image;
  private _touchingCount: number = 100;

  get color() {
    return this._color;
  }

  get radius() {
    return this.width * 0.5;
  }

  get physicsRadius() {
    return this.radius * 0.8;
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
    this.createShadow();
  }

  getScale() {
    return this._scale;
  }

  getShadow() {
    return this.shadow;
  }

  reInit() {
    this.angle = 0;
    this._touchingCount = 100;
    this.setScale(this.getScale());
    this.alpha = 1;
    this.body.checkCollision.none = false;
    this.setDepth(1)
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
  createExplodeEffect() {
    this.body.enable = false;
    this.scene.tweens.add({
      targets: this,
      scale: this.getScale() * 1.5,
      duration: 100,
      ease: "Power0",
      onComplete: (tween) => {
        this.setVisible(false);
        var img = this.scene.add
          .image(this.x, this.y, TextureKeys.BrokenGlass)
          .setScale(0.1);
        // img.setTint(ball.color);
        this.scene.tweens.add({
          targets: img,
          scale: 0.5,
          alpha: 0,
          duration: 3000,
          ease: "Power4",
        });

        this.scene.add
          .particles(TextureKeys.BrokenPiece)
          .createEmitter({
            speed: { min: -200, max: 200 },
            angle: { min: 0, max: 360 },
            scale: { start: 1, end: 0 },
            alpha: { start: 1, end: 0 },
            blendMode: "ADD",
            active: true,
            lifespan: 3000,
            gravityY: 50,
            tint: { start: this.color, end: 0xffffff },
            rotate: { start: 0, end: 360 * 5, random: true },
          })
          .explode(5, this.x, this.y);
        
          this.scene.game.events.emit("ball-over-scene", this);
      },
    });
  }

  useCircleCollider() {
    const radius = this.radius;
    const usedRadius = this.physicsRadius;
    const diff = radius - usedRadius;

    this.setCircle(usedRadius, diff, diff);

    return this;
  }

  useSmallCircleCollider() {
    const radius = this.radius;
    const usedRadius = this.physicsRadius * 0.3;
    const diff = radius - usedRadius;

    this.setCircle(usedRadius, diff, diff);

    return this;
  }

  useMediumCircleCollider() {
    const radius = this.radius;
    const usedRadius = this.physicsRadius * 0.8;
    const diff = radius - usedRadius;

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

  update() {
    if (this.y > this.scene.scale.height) {
      this.scene.game.events.emit("ball-over-scene", this);
    }
    this.angle += this.body.deltaX();
    this.updateShadowPosition();
    if (this.body.wasTouching && this.body.allowGravity) {
      this._touchingCount -= 1;
      if (this._touchingCount === 0) {
        this.body.checkCollision.none = true;
        this.setDepth(2)
        this.createExplodeEffect()
      }
    }
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

  updateShadowPosition() {
    this.shadow.setVisible(this.visible);
    this.shadow.setActive(this.active);
    this.shadow.x = this.x + 10;
    this.shadow.y = this.y + 10;
  }

  private createShadow() {
    this.shadow = this.scene.add.image(
      this.x + 10,
      this.y + 10,
      TextureKeys.VirusYellow
    );
    this.shadow.setScale(this.getScale());
    this.shadow.setTint(0x000000);
    this.shadow.alpha = 0.3;
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
