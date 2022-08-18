import Phaser from "phaser";
import { LightColor } from "~/consts/Colors";

import IShotGuide from "~/types/IShotGuide";

const DPR = window.devicePixelRatio;

class GuideCircle extends Phaser.GameObjects.Arc {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 4 * DPR, 0, 360, false, LightColor, 1);
  }
}

export default class ShotGuide implements IShotGuide {
  private scene: Phaser.Scene;
  private group: Phaser.GameObjects.Group;
  private toggleCurrent: number = 41;
  private toggleDistance: number = 40;

  private guides: GuideCircle[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    this.group = scene.add.group({
      classType: GuideCircle,
    });
  }

  showFrom(
    x: number,
    y: number,
    direction: Phaser.Math.Vector2,
    radius: number,
    color: number = LightColor
  ) {
    const width = this.scene.scale.width;
    const count = 1000;

    if (this.guides.length <= 0) {
      for (let i = 0; i < count; ++i) {
        this.toggleCurrent--;
        if ((this.toggleCurrent + i) % this.toggleDistance != 0 ) {
          return;
        }

        const guide = this.group.get(0, 0) as GuideCircle;
        guide.setActive(true);
        guide.setVisible(true);
        guide.fillColor = color;
        this.guides.push(guide);
      }
    }


    const stepInterval = DPR / 2;
    let vx = direction.x;
    const vy = direction.y;

    x += vx * radius;
    y += vy * radius;

    for (let i = 0; i < count; ++i) {
      let nx = x + vx * stepInterval;
      const ny = y + vy * stepInterval;

      if (nx <= radius) {
        vx *= -1;
        nx = vx * radius;
        nx += vx * radius;
      } else if (nx >= width - radius) {
        vx *= -1;
        nx = width + vx * radius;
        nx += vx * radius;
      }

      x = nx;
      y = ny;

      const guide = this.guides[i];
      guide.x = x;
      guide.y = y;

      if ((this.toggleCurrent + i) % this.toggleDistance == 0 ) {
        guide.setVisible(true);
        guide.setActive(true);
      } else {
        guide.setVisible(false);
        guide.setActive(false);
      } 

    }

    this.toggleCurrent--;
    if (this.toggleCurrent === 0) this.toggleCurrent = this.toggleDistance
  }

  hide() {
    this.guides.forEach((guide) => this.group.killAndHide(guide));
    this.guides.length = 0;
    this.toggleCurrent = this.toggleDistance + 1
  }
}
