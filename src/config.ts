import { DarkColor } from "~/consts/Colors";
import ElementKeys from "~/consts/ElementKeys";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: ElementKeys.ContainerId,
  dom: {
    createContainer: true,
  },
  backgroundColor: 0x001013,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 1200 },
      debug: true,
    },
  },
  fps: {
    target: 60,
    // forceSetTimeOut: true
  },
  scale: {
    mode: Phaser.Scale.ScaleModes.FIT,
    autoCenter: Phaser.Scale.Center.CENTER_BOTH,
    width: "100%",
    height: "100%",
  },
};

export default config;
