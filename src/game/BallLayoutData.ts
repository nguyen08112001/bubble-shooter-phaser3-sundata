import { Scene } from "phaser";
export const Red = "r";
export const Gre = "g";
export const Yel = "y";

const AllColors = [Red, Gre, Yel];

export default class BallLayoutData {
  private growthModel: IGrowthModel;

  constructor(growthModel: IGrowthModel) {
    this.growthModel = growthModel;
  }

  getNextRow(scene: Phaser.Scene, size: any) {
    const tmp = Math.round(scene.scale.width / size) - 1;

    const count = this.growthModel.getNext(tmp);

    // TODO: potentially randomize positions when less than 6 available

    const ret: string[] = [];
    for (let i = 0; i < count; ++i) {
      ret.push(this.getRandomColor());
    }
    return ret;
  }

  private getRandomColor() {
    const size = AllColors.length;
    const r = Math.floor(Math.random() * size);
    return AllColors[r];
  }
}
