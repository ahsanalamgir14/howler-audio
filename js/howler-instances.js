// https://github.com/goldfire/howler.js

const fadeDuration = 1000; // Duration for fade in/out in milliseconds
const sound3Duration = 2000; // Duration for sound3 in milliseconds

// Universal sound management system
class SoundManager {
  constructor() {
    this.sounds = new Map(); // Map to store all sound instances
    this.activeSounds = new Map(); // Map to track active sound IDs
  }

  // Register a sound with its controls
  registerSound(id, howlInstance, playButton, volumeSlider, isLoop = false) {
    this.sounds.set(id, {
      howl: howlInstance,
      playButton: playButton,
      volumeSlider: volumeSlider,
      isLoop: isLoop,
      soundId: null,
    });
  }

  // Play a sound
  playSound(id) {
    const sound = this.sounds.get(id);
    if (!sound || sound.howl.playing()) return;

    sound.soundId = sound.howl.play();
    sound.howl.volume(0, sound.soundId);
    sound.howl.once("play", () => {
      sound.howl.fade(0, sound.volumeSlider.value, fadeDuration, sound.soundId);
    });
    sound.playButton.src = "images/stop.png";
    sound.volumeSlider.classList.remove("hidden");
    this.activeSounds.set(id, sound.soundId);
  }

  // Stop a specific sound
  stopSound(id) {
    const sound = this.sounds.get(id);
    if (!sound || !sound.soundId) return;

    sound.howl.fade(
      sound.howl.volume(sound.soundId),
      0,
      fadeDuration,
      sound.soundId
    );
    // Restore the original play button image based on the sound ID
    const playImageNumber = id.replace("sound", "");
    sound.playButton.src = `images/play${playImageNumber}.png`;
    sound.volumeSlider.classList.add("hidden");

    setTimeout(() => {
      sound.howl.stop(sound.soundId);
      sound.soundId = null;
      this.activeSounds.delete(id);
    }, fadeDuration);
  }

  // Stop all sounds
  stopAllSounds() {
    console.log("Stopping all sounds...");

    this.activeSounds.forEach((soundId, soundKey) => {
      const sound = this.sounds.get(soundKey);
      if (sound) {
        sound.howl.fade(sound.howl.volume(soundId), 0, fadeDuration, soundId);
        // Restore the original play button image based on the sound ID
        const playImageNumber = soundKey.replace("sound", "");
        sound.playButton.src = `images/play${playImageNumber}.png`;
        sound.volumeSlider.classList.add("hidden");

        setTimeout(() => {
          sound.howl.stop(soundId);
          sound.soundId = null;
        }, fadeDuration);
      }
    });

    this.activeSounds.clear();
  }

  // Handle volume change for a sound
  setVolume(id, volume) {
    const sound = this.sounds.get(id);
    if (sound && sound.soundId) {
      sound.howl.volume(volume, sound.soundId);
    }
  }

  // Handle seamless loop (special case)
  registerSeamlessLoop(id, loopInstance, playButton, volumeSlider) {
    this.sounds.set(id, {
      loop: loopInstance,
      playButton: playButton,
      volumeSlider: volumeSlider,
      isLoop: true,
      isPlaying: false,
    });
  }

  // Play seamless loop
  playSeamlessLoop(id) {
    const sound = this.sounds.get(id);
    if (!sound || sound.isPlaying) return;

    sound.loop.start("sound3");
    sound.isPlaying = true;
    sound.playButton.src = "images/stop.png";
    sound.volumeSlider.classList.remove("hidden");

    setTimeout(() => {
      const targetVolume = parseFloat(sound.volumeSlider.value);
      const fadeSteps = 10;
      const interval = fadeDuration / fadeSteps;
      let step = targetVolume / fadeSteps;
      let current = 0;

      const fadeIn = setInterval(() => {
        current += step;
        if (current >= targetVolume) {
          sound.loop.volume(targetVolume);
          clearInterval(fadeIn);
        } else {
          sound.loop.volume(current);
        }
      }, interval);
    }, 200);
  }

  // Stop seamless loop
  stopSeamlessLoop(id) {
    const sound = this.sounds.get(id);
    if (!sound || !sound.isPlaying) return;

    const currentVolume = parseFloat(sound.volumeSlider.value);
    const fadeSteps = 10;
    const interval = fadeDuration / fadeSteps;
    let step = currentVolume / fadeSteps;
    let current = currentVolume;

    const fadeOut = setInterval(() => {
      current -= step;
      if (current <= 0) {
        sound.loop.volume(0);
        clearInterval(fadeOut);
        sound.loop.stop();
        // Restore the original play button image based on the sound ID
        const playImageNumber = id.replace("sound", "");
        sound.playButton.src = `images/play${playImageNumber}.png`;
        sound.volumeSlider.classList.add("hidden");
        sound.isPlaying = false;
        console.log(`${id} (SeamlessLoop) faded and stopped.`);
      } else {
        sound.loop.volume(current);
      }
    }, interval);
  }

  // Stop all seamless loops
  stopAllSeamlessLoops() {
    this.sounds.forEach((sound, id) => {
      if (sound.isLoop && sound.isPlaying) {
        this.stopSeamlessLoop(id);
      }
    });
  }
}

// Initialize sound manager
const soundManager = new SoundManager();

// -------------------------
// Sound 1 (Bullet - Notification Sound)
// -------------------------
const playPauseBtn1 = document.getElementById("playBtn1");
const volumeSlider1 = document.getElementById("volumeSlider1");

const sound1 = new Howl({
  src: ["nogap_sounds/dj-single.mp3"],
  loop: false,
  html5: true,
  onend: function () {
    playPauseBtn1.src = "images/play1.png";
    volumeSlider1.classList.add("hidden");
    soundManager.activeSounds.delete("sound1");
  },
});

soundManager.registerSound("sound1", sound1, playPauseBtn1, volumeSlider1);

playPauseBtn1.addEventListener("click", function () {
  if (!sound1.playing()) {
    soundManager.playSound("sound1");
  }
});

volumeSlider1.addEventListener("input", function () {
  soundManager.setVolume("sound1", volumeSlider1.value);
});

// -------------------------
// Sound 2 (Charge)
// -------------------------
const playPauseBtn2 = document.getElementById("playBtn2");
const volumeSlider2 = document.getElementById("volumeSlider2");

const sound2 = new Howl({
  src: ["nogap_sounds/sound2.ogg"],
  loop: false,
  html5: true,
  onend: function () {
    playPauseBtn2.src = "images/play2.png";
    volumeSlider2.classList.add("hidden");
    soundManager.activeSounds.delete("sound2");
  },
});

soundManager.registerSound("sound2", sound2, playPauseBtn2, volumeSlider2);

playPauseBtn2.addEventListener("click", function () {
  if (sound2.playing()) {
    soundManager.stopSound("sound2");
  } else {
    soundManager.playSound("sound2");
  }
});

volumeSlider2.addEventListener("input", function () {
  soundManager.setVolume("sound2", volumeSlider2.value);
});

// -------------------------
// Sound 3 (Seamless Loop)
// -------------------------
const loop = new SeamlessLoop();
loop.addUri("nogap_sounds/sound3.ogg", sound3Duration, "sound3");

const playPauseBtn3 = document.getElementById("playBtn3");
const volumeSlider3 = document.getElementById("volumeSlider3");

soundManager.registerSeamlessLoop("sound3", loop, playPauseBtn3, volumeSlider3);

playPauseBtn3.addEventListener("click", function () {
  const sound = soundManager.sounds.get("sound3");
  if (!sound.isPlaying) {
    soundManager.playSeamlessLoop("sound3");
  } else {
    soundManager.stopSeamlessLoop("sound3");
  }
});

volumeSlider3.addEventListener("input", function () {
  const sound = soundManager.sounds.get("sound3");
  if (sound && sound.isPlaying) {
    sound.loop.volume(parseFloat(volumeSlider3.value));
  }
});

// -------------------------
// Stop All Sounds Button
// -------------------------
const stopButton = document.querySelector(".stopbutton");
console.log("stopButton element:", stopButton);

stopButton.addEventListener("click", function () {
  console.log("Stop All Sounds button clicked.");
  soundManager.stopAllSounds();
  soundManager.stopAllSeamlessLoops();
});

// Example of how to easily add more sounds:
// Just uncomment and modify these blocks to add more sounds

/*
// -------------------------
// Sound 4 (Example - White Noise)
// -------------------------
const playPauseBtn4 = document.getElementById("playBtn4");
const volumeSlider4 = document.getElementById("volumeSlider4");

const sound4 = new Howl({
  src: ["nogap_sounds/white-noise.ogg"],
  loop: false,
  html5: true,
  onend: function () {
    playPauseBtn4.src = "images/play4.png";
    volumeSlider4.classList.add("hidden");
    soundManager.activeSounds.delete("sound4");
  },
});

soundManager.registerSound("sound4", sound4, playPauseBtn4, volumeSlider4);

playPauseBtn4.addEventListener("click", function () {
  if (sound4.playing()) {
    soundManager.stopSound("sound4");
  } else {
    soundManager.playSound("sound4");
  }
});

volumeSlider4.addEventListener("input", function () {
  soundManager.setVolume("sound4", volumeSlider4.value);
});

// -------------------------
// Sound 5 (Example - Pink Noise)
// -------------------------
const playPauseBtn5 = document.getElementById("playBtn5");
const volumeSlider5 = document.getElementById("volumeSlider5");

const sound5 = new Howl({
  src: ["nogap_sounds/pink-noise.ogg"],
  loop: false,
  html5: true,
  onend: function () {
    playPauseBtn5.src = "images/play5.png";
    volumeSlider5.classList.add("hidden");
    soundManager.activeSounds.delete("sound5");
  },
});

soundManager.registerSound("sound5", sound5, playPauseBtn5, volumeSlider5);

playPauseBtn5.addEventListener("click", function () {
  if (sound5.playing()) {
    soundManager.stopSound("sound5");
  } else {
    soundManager.playSound("sound5");
  }
});

volumeSlider5.addEventListener("input", function () {
  soundManager.setVolume("sound5", volumeSlider5.value);
});
*/
