import Phaser from "phaser";

import TextureKeys from "~/consts/TextureKeys";
import GameEvents from "~/consts/GameEvents";
import AudioKeys from "~/consts/AudioKeys";

export default class Preload extends Phaser.Scene {
  preload() {
    // this.load.image(
    //   TextureKeys.Background,
    //   "https://mir-s3-cdn-cf.behance.net/project_modules/max_632/dc3b2546601081.585ad762e70eb.jpg"
    // );
    this.load.image(
      TextureKeys.Background,
      "https://app-96863.games-storage.yandex.net/96863/nlrz4jbpuqrfdnfxtnjszxj9b42d8sor/assets/Backgrounds/Background_05.jpg"
    );
    this.load.image(TextureKeys.Virus, "assets/game/coronavirus.png");
    // this.load.image(TextureKeys.VirusRed, 'assets/game/virus_red.png')
    this.load.image(TextureKeys.VirusRed, "assets/game/tile000.png");
    this.load.image(TextureKeys.VirusGreen, "assets/game/tile001.png");
    this.load.image(TextureKeys.VirusYellow, "assets/game/tile002.png");
    this.load.image(TextureKeys.VirusParticles, "assets/game/light_02.png");
    this.load.image(
      TextureKeys.BrokenGlass,
      "https://raw.githubusercontent.com/nguyen08112001/breakout-sundata/main/assets/images/broken-glass.png"
    );
    this.load.image(
      TextureKeys.BrokenPiece,
      "https://raw.githubusercontent.com/nguyen08112001/breakout-sundata/main/assets/images/broken.png"
    );
    this.load.atlas(
      TextureKeys.FlareParticles,
      "https://labs.phaser.io/assets/particles/flares.png",
      "https://labs.phaser.io/assets/particles/flares.json"
    );
    this.load.image(TextureKeys.Shooter, "assets/game/shooter.png");

    this.load.audio(
      AudioKeys.MusicLoop,
      "assets/game/music/imminent-threat-loop-var.wav"
    );

    this.load.audio(AudioKeys.ShootBall, "assets/game/sfx/highUp.wav");
    this.load.audio(AudioKeys.AttachToGrid, "assets/game/sfx/phaserUp5.wav");
    this.load.audio(AudioKeys.ClearMatches, "assets/game/sfx/threeTone2.wav");
    this.load.audio(
      AudioKeys.ClearMatchesExtra1,
      "assets/game/sfx/powerUp8.wav"
    );
    this.load.audio(AudioKeys.OrphanCleared, "assets/game/sfx/zap1.wav");
    this.load.audio(AudioKeys.UIClick, "assets/game/sfx/click_003.wav");
    this.load.audio(AudioKeys.GameOverFoley, "assets/game/sfx/lowDown.wav");
  }

  create() {
    this.sound.play(AudioKeys.MusicLoop, {
      loop: true,
    });

    this.game.events.emit(GameEvents.PreloadFinished);
  }
}
