// https://github.com/goldfire/howler.js

const fadeDuration = 1000; // Duration for fade in/out in milliseconds
const sound3Duration = 2000; // Duration for sound3 in milliseconds

// Universal sound management system with DJ Sidebar
class SoundManager {
  constructor() {
    this.sounds = new Map(); // Map to store all sound instances
    this.activeSounds = new Map(); // Map to track active sound IDs
    this.soundNames = new Map(); // Map to store sound names for display
    this.initSidebar();
  }

  // Initialize the DJ sidebar
  initSidebar() {
    this.activeTracksContainer = document.getElementById("activeTracks");
    this.activeCountElement = document.getElementById("activeCount");
    this.totalSoundsElement = document.getElementById("totalSounds");

    // Start monitoring button states to ensure consistency
    this.startButtonStateMonitor();
  }

  // Register a sound with its controls and name
  registerSound(
    id,
    howlInstance,
    playButton,
    volumeSlider,
    soundName,
    isLoop = false
  ) {
    this.sounds.set(id, {
      howl: howlInstance,
      playButton: playButton,
      volumeSlider: volumeSlider,
      isLoop: isLoop,
      soundId: null,
    });
    this.soundNames.set(id, soundName);
    this.updateTotalSounds();
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

    // Preload and set stop image
    this.setButtonImage(sound.playButton, "images/stop.png");
    sound.volumeSlider.classList.remove("hidden");
    this.activeSounds.set(id, sound.soundId);

    // Add to sidebar
    this.addToSidebar(id);
    this.updateActiveCount();
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
    this.setButtonImage(sound.playButton, `images/play${playImageNumber}.png`);
    sound.volumeSlider.classList.add("hidden");

    setTimeout(() => {
      sound.howl.stop(sound.soundId);
      sound.soundId = null;
      this.activeSounds.delete(id);

      // Remove from sidebar
      this.removeFromSidebar(id);
      this.updateActiveCount();
    }, fadeDuration);
  }

  // Stop all sounds
  stopAllSounds() {
    console.log("Stopping all sounds...");

    this.activeSounds.forEach((soundId, soundKey) => {
      // Skip bullet sound (sound1) as it's non-stoppable
      if (soundKey === "sound1") return;

      const sound = this.sounds.get(soundKey);
      if (sound) {
        sound.howl.fade(sound.howl.volume(soundId), 0, fadeDuration, soundId);
        // Restore the original play button image based on the sound ID
        const playImageNumber = soundKey.replace("sound", "");
        this.setButtonImage(
          sound.playButton,
          `images/play${playImageNumber}.png`
        );
        sound.volumeSlider.classList.add("hidden");

        setTimeout(() => {
          sound.howl.stop(soundId);
          sound.soundId = null;
        }, fadeDuration);
      }
    });

    this.activeSounds.clear();
    this.clearSidebar();
    this.updateActiveCount();
  }

  // Handle volume change for a sound
  setVolume(id, volume) {
    const sound = this.sounds.get(id);
    if (sound && sound.soundId) {
      sound.howl.volume(volume, sound.soundId);
    }
  }

  // Handle seamless loop (special case)
  registerSeamlessLoop(id, loopInstance, playButton, volumeSlider, soundName) {
    this.sounds.set(id, {
      loop: loopInstance,
      playButton: playButton,
      volumeSlider: volumeSlider,
      isLoop: true,
      isPlaying: false,
    });
    this.soundNames.set(id, soundName);
    this.updateTotalSounds();
  }

  // Play seamless loop
  playSeamlessLoop(id) {
    const sound = this.sounds.get(id);
    if (!sound || sound.isPlaying) return;

    sound.loop.start("sound3");
    sound.isPlaying = true;
    this.setButtonImage(sound.playButton, "images/stop.png");
    sound.volumeSlider.classList.remove("hidden");

    // Add to sidebar
    this.addToSidebar(id);
    this.updateActiveCount();

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
        this.setButtonImage(
          sound.playButton,
          `images/play${playImageNumber}.png`
        );
        sound.volumeSlider.classList.add("hidden");
        sound.isPlaying = false;
        console.log(`${id} (SeamlessLoop) faded and stopped.`);

        // Remove from sidebar
        this.removeFromSidebar(id);
        this.updateActiveCount();
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

  // Add sound to sidebar
  addToSidebar(id) {
    const soundName = this.soundNames.get(id);
    const sound = this.sounds.get(id);

    // Remove "no sounds playing" message if it exists
    const noSoundsMsg =
      this.activeTracksContainer.querySelector(".text-gray-500");
    if (noSoundsMsg) {
      noSoundsMsg.remove();
    }

    // Check if track is already in sidebar
    const existingTrack = document.getElementById(`sidebar-track-${id}`);
    if (existingTrack) return;

    // Create track element
    const trackElement = document.createElement("div");
    trackElement.id = `sidebar-track-${id}`;
    trackElement.className =
      "bg-gray-700 rounded-lg p-3 border border-gray-600";

    const isLoop = sound.isLoop;
    const isPlaying = isLoop ? sound.isPlaying : sound.soundId !== null;

    trackElement.innerHTML = `
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 rounded-full ${
            isPlaying ? "bg-green-500 animate-pulse" : "bg-gray-500"
          }"></div>
          <span class="text-sm font-medium text-white">${soundName}</span>
        </div>
        <button onclick="soundManager.stopFromSidebar('${id}')" class="text-red-400 hover:text-red-300 text-sm">
          ✕
        </button>
      </div>
      <div class="flex items-center space-x-2">
        <input type="range" 
               min="0" max="1" step="0.1" 
               value="${sound.volumeSlider.value}"
               onchange="soundManager.setVolumeFromSidebar('${id}', this.value)"
               class="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider">
        <span class="text-xs text-gray-400 w-8">${Math.round(
          sound.volumeSlider.value * 100
        )}%</span>
      </div>
    `;

    this.activeTracksContainer.appendChild(trackElement);
  }

  // Remove sound from sidebar
  removeFromSidebar(id) {
    const trackElement = document.getElementById(`sidebar-track-${id}`);
    if (trackElement) {
      trackElement.remove();
    }

    // Show "no sounds playing" message if no tracks left
    if (this.activeTracksContainer.children.length === 0) {
      this.activeTracksContainer.innerHTML = `
        <div class="text-center text-gray-500 py-8">
          <p>No sounds playing</p>
          <p class="text-sm">Start playing sounds to see them here</p>
        </div>
      `;
    }
  }

  // Clear sidebar
  clearSidebar() {
    this.activeTracksContainer.innerHTML = `
      <div class="text-center text-gray-500 py-8">
        <p>No sounds playing</p>
        <p class="text-sm">Start playing sounds to see them here</p>
      </div>
    `;
  }

  // Stop sound from sidebar
  stopFromSidebar(id) {
    const sound = this.sounds.get(id);
    if (sound.isLoop) {
      this.stopSeamlessLoop(id);
    } else {
      this.stopSound(id);
    }
  }

  // Set volume from sidebar
  setVolumeFromSidebar(id, volume) {
    const sound = this.sounds.get(id);
    if (sound.isLoop) {
      sound.loop.volume(parseFloat(volume));
    } else {
      this.setVolume(id, volume);
    }

    // Update the volume display
    const trackElement = document.getElementById(`sidebar-track-${id}`);
    if (trackElement) {
      const volumeDisplay = trackElement.querySelector(".text-gray-400");
      if (volumeDisplay) {
        volumeDisplay.textContent = `${Math.round(volume * 100)}%`;
      }
    }
  }

  // Update active count
  updateActiveCount() {
    const count =
      this.activeSounds.size +
      Array.from(this.sounds.values()).filter((s) => s.isLoop && s.isPlaying)
        .length;
    this.activeCountElement.textContent = count;
  }

  // Update total sounds count
  updateTotalSounds() {
    this.totalSoundsElement.textContent = this.sounds.size;
  }

  // Set button image with preloading to prevent broken images
  setButtonImage(button, imagePath) {
    // Create a new image element to preload
    const img = new Image();

    img.onload = () => {
      // Only set the src when the image is fully loaded
      button.src = imagePath;
    };

    img.onerror = () => {
      console.warn(`Failed to load image: ${imagePath}`);
      // Fallback to stop.png if play image fails, or keep current if stop fails
      if (imagePath.includes("stop.png")) {
        button.src = "images/stop.png"; // Try again with stop image
      }
    };

    // Start loading the image
    img.src = imagePath;
  }

  // Force update all button states - ensures consistency
  updateAllButtonStates() {
    this.sounds.forEach((sound, id) => {
      // Skip bullet sound (sound1) as it's non-stoppable and manages its own state
      if (id === "sound1") return;

      const isPlaying = sound.isLoop ? sound.isPlaying : sound.soundId !== null;
      const playImageNumber = id.replace("sound", "");

      if (!isPlaying) {
        // Sound is not playing, ensure it shows play button
        this.setButtonImage(
          sound.playButton,
          `images/play${playImageNumber}.png`
        );
        sound.volumeSlider.classList.add("hidden");
      } else {
        // Sound is playing, ensure it shows stop button
        this.setButtonImage(sound.playButton, "images/stop.png");
        sound.volumeSlider.classList.remove("hidden");
      }
    });
  }

  // Check and fix button states periodically
  startButtonStateMonitor() {
    setInterval(() => {
      this.updateAllButtonStates();
    }, 2000); // Check every 2 seconds
  }
}

// Initialize sound manager
const soundManager = new SoundManager();

// Global sound completion handler to catch any missed events
document.addEventListener("DOMContentLoaded", () => {
  // Add a global handler for any sound completion
  setInterval(() => {
    soundManager.sounds.forEach((sound, id) => {
      if (!sound.isLoop) {
        // Skip bullet sound (sound1) as it's non-stoppable
        if (id === "sound1") return;

        // For regular sounds, check if they're still playing
        if (sound.soundId && !sound.howl.playing()) {
          // Sound has ended but onend wasn't called, fix the state
          sound.soundId = null;
          soundManager.activeSounds.delete(id);
          soundManager.removeFromSidebar(id);
          soundManager.updateActiveCount();

          const playImageNumber = id.replace("sound", "");
          soundManager.setButtonImage(
            sound.playButton,
            `images/play${playImageNumber}.png`
          );
          sound.volumeSlider.classList.add("hidden");
        }
      }
    });
  }, 1000); // Check every second
});

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
    // Ensure button state is updated
    soundManager.setButtonImage(playPauseBtn1, "images/play1.png");
    volumeSlider1.classList.add("hidden");
    soundManager.activeSounds.delete("sound1");
    soundManager.removeFromSidebar("sound1");
    soundManager.updateActiveCount();

    // Force update button state after a short delay to ensure consistency
    setTimeout(() => {
      soundManager.updateAllButtonStates();
    }, 100);
  },
});

soundManager.registerSound(
  "sound1",
  sound1,
  playPauseBtn1,
  volumeSlider1,
  "Bullet"
);

playPauseBtn1.addEventListener("click", function () {
  // Bullet is non-stoppable - only allow playing if not currently playing
  if (!sound1.playing()) {
    soundManager.playSound("sound1");
  }
  // If already playing, do nothing - button is disabled until sound ends
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
    // Ensure button state is updated
    soundManager.setButtonImage(playPauseBtn2, "images/play2.png");
    volumeSlider2.classList.add("hidden");
    soundManager.activeSounds.delete("sound2");
    soundManager.removeFromSidebar("sound2");
    soundManager.updateActiveCount();

    // Force update button state after a short delay to ensure consistency
    setTimeout(() => {
      soundManager.updateAllButtonStates();
    }, 100);
  },
});

soundManager.registerSound(
  "sound2",
  sound2,
  playPauseBtn2,
  volumeSlider2,
  "Charge"
);

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

soundManager.registerSeamlessLoop(
  "sound3",
  loop,
  playPauseBtn3,
  volumeSlider3,
  "Seamless Noise"
);

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
const stopAllBtn = document.getElementById("stopAllBtn");

stopAllBtn.addEventListener("click", function () {
  console.log("Stop All Sounds button clicked.");
  soundManager.stopAllSounds();
  soundManager.stopAllSeamlessLoops();
});

// ========================================
// SCALABLE TEMPLATE FOR ADDING MORE SOUNDS
// ========================================
/*
To add more sounds, just copy this template and modify:

// -------------------------
// Sound X (Your Sound Name)
// -------------------------
const playPauseBtnX = document.getElementById("playBtnX");
const volumeSliderX = document.getElementById("volumeSliderX");

const soundX = new Howl({
  src: ["nogap_sounds/your-sound-file.mp3"],
  loop: false,
  html5: true,
  onend: function () {
    playPauseBtnX.src = "images/play1.png"; // or play2.png, play3.png
    volumeSliderX.classList.add("hidden");
    soundManager.activeSounds.delete("soundX");
    soundManager.removeFromSidebar("soundX");
    soundManager.updateActiveCount();
  },
});

soundManager.registerSound("soundX", soundX, playPauseBtnX, volumeSliderX, "Your Sound Name");

playPauseBtnX.addEventListener("click", function () {
  if (soundX.playing()) {
    soundManager.stopSound("soundX");
  } else {
    soundManager.playSound("soundX");
  }
});

volumeSliderX.addEventListener("input", function () {
  soundManager.setVolume("soundX", volumeSliderX.value);
});

Don't forget to add the HTML controls in index.html:
<div class="audio-controls bg-gray-800 p-4 rounded-lg border border-gray-700">
  <p class="text-sm font-semibold mb-2 text-blue-300">Your Sound Name</p>
  <img id="playBtnX" class="playButton w-12 h-12 cursor-pointer hover:opacity-80 transition-opacity" src="images/play1.png" alt="play-stop btn">
  <input type="range" id="volumeSliderX" class="hidden w-full mt-2" min="0" max="1" step="0.1" value="1">
</div>
*/
