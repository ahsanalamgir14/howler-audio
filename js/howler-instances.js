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
  // Also stop all dynamically loaded seamless sounds
  simpleSeamlessLoader.stopAllSeamlessSounds();
});

// ========================================
// SIMPLE SEAMLESS SOUND LOADER
// ========================================

class SimpleSeamlessLoader {
  constructor() {
    this.seamlessSounds = new Map();
    this.seamlessFolder = "nogap_sounds/seamless/";
    this.supportedFormats = [".ogg", ".mp3", ".wav", ".m4a"];

    // Auto-initialize when DOM is ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.init());
    } else {
      this.init();
    }
  }

  init() {
    this.loadSeamlessSoundsFromFolder();
  }

  // Load seamless sounds from folder
  async loadSeamlessSoundsFromFolder() {
    try {
      console.log("Loading seamless sounds from folder...");

      // Load files from static list
      const filesLoaded = await this.loadFromStaticList();

      if (!filesLoaded) {
        // Fallback: generate demo sounds for testing
        await this.generateSimpleSeamlessSounds();
      }

      this.addSeamlessSoundsToExistingColumn();
    } catch (error) {
      console.error("Error loading seamless sounds:", error);
    }
  }

  // Load files from static list (manually update this when you add new files)
  async loadFromStaticList() {
    // MANUAL FILE LIST - Update this when you add new files to nogap_sounds/seamless/
    const staticFileList = [
      "seamless_001.ogg",
      "seamless_002.ogg",
      // Add more files here: 'seamless_011.ogg', 'seamless_012.ogg', etc.
    ];

    console.log("Checking for files in:", this.seamlessFolder);
    console.log("Looking for files:", staticFileList);

    let foundFiles = [];

    // Test each file to see if it exists
    for (const fileName of staticFileList) {
      const fullPath = `${this.seamlessFolder}${fileName}`;
      console.log(`Testing file: ${fullPath}`);

      try {
        const response = await fetch(fullPath);
        console.log(
          `Response for ${fileName}:`,
          response.status,
          response.statusText
        );

        if (response.ok) {
          foundFiles.push(fileName);
          console.log(`✅ Found file: ${fileName}`);
        } else {
          console.log(`❌ File not found (${response.status}): ${fileName}`);
        }
      } catch (error) {
        // File doesn't exist, continue to next
        console.log(`❌ Error loading ${fileName}:`, error.message);
      }
    }

    console.log(`Total files found: ${foundFiles.length}`);
    console.log("Found files:", foundFiles);

    if (foundFiles.length > 0) {
      // Register found files
      foundFiles.forEach((fileName, index) => {
        const fileExtension = fileName.split(".").pop();
        const baseName = fileName.replace(`.${fileExtension}`, "");

        this.registerSeamlessSound({
          id: `seamless_${(index + 1).toString().padStart(3, "0")}`,
          filePath: `${this.seamlessFolder}${fileName}`,
          name: `${baseName.charAt(0).toUpperCase() + baseName.slice(1)}`,
          volume: 0.8,
        });
      });

      console.log(`✅ Loaded ${foundFiles.length} files from static list`);
      return true;
    }

    console.log("❌ No files found from static list, using demo sounds");
    return false;
  }

  // Generate simple seamless sounds for testing
  async generateSimpleSeamlessSounds() {
    const sounds = [];

    // Generate 10 simple sounds
    for (let i = 1; i <= 10; i++) {
      const format =
        this.supportedFormats[
          Math.floor(Math.random() * this.supportedFormats.length)
        ];

      sounds.push({
        id: `seamless_${i.toString().padStart(3, "0")}`,
        filePath: `${this.seamlessFolder}seamless_${i
          .toString()
          .padStart(3, "0")}${format}`,
        name: `Seamless Sound ${i}`,
        volume: 0.8,
      });
    }

    sounds.forEach((soundData) => {
      this.registerSeamlessSound(soundData);
    });

    console.log(`Generated ${sounds.length} simple seamless sounds`);
  }

  // Register a seamless sound
  registerSeamlessSound(soundData) {
    const { id, filePath, name, volume = 1.0 } = soundData;

    this.seamlessSounds.set(id, {
      id,
      filePath,
      name,
      volume,
      isPlaying: false,
      howlInstance: null,
      currentSoundId: null,
    });
  }

  // Add seamless sounds to existing seamless column
  addSeamlessSoundsToExistingColumn() {
    // Try multiple selectors to find the seamless column
    let seamlessColumn = document.querySelector(
      ".grid.grid-cols-1.lg\\:grid-cols-3 > div:last-child"
    );

    if (!seamlessColumn) {
      // Try alternative selector
      seamlessColumn = document.querySelector(
        ".grid.grid-cols-1.lg\\:grid-cols-3 > div:nth-child(3)"
      );
    }

    if (!seamlessColumn) {
      // Try finding by content
      const allColumns = document.querySelectorAll(
        ".grid.grid-cols-1.lg\\:grid-cols-3 > div"
      );
      seamlessColumn = Array.from(allColumns).find(
        (col) =>
          col.textContent.includes("Seamless") || col.textContent.includes("🔄")
      );
    }

    if (!seamlessColumn) {
      console.error("Seamless column not found - trying all columns");
      // Debug: log all columns
      const allColumns = document.querySelectorAll(
        ".grid.grid-cols-1.lg\\:grid-cols-3 > div"
      );
      console.log("Found columns:", allColumns.length);
      allColumns.forEach((col, index) => {
        console.log(`Column ${index}:`, col.textContent.substring(0, 50));
      });
      return;
    }

    console.log("Found seamless column:", seamlessColumn);

    // Find the existing seamless controls container
    let existingControls = seamlessColumn.querySelector(".space-y-4");

    if (!existingControls) {
      // Try alternative selectors
      existingControls = seamlessColumn.querySelector(
        ".space-y-4, div:last-child, .audio-controls"
      ).parentElement;
    }

    if (!existingControls) {
      // Create the container if it doesn't exist
      existingControls = document.createElement("div");
      existingControls.className = "space-y-4";
      seamlessColumn.appendChild(existingControls);
      console.log("Created new controls container");
    }

    if (!existingControls) {
      console.error(
        "Seamless controls container not found and could not be created"
      );
      return;
    }

    console.log("Found controls container:", existingControls);

    // Add reload button to the header
    const header = seamlessColumn.querySelector(".text-center.mb-6");
    if (header && !header.querySelector("#reloadSeamlessBtn")) {
      const reloadBtn = document.createElement("button");
      reloadBtn.id = "reloadSeamlessBtn";
      reloadBtn.className =
        "bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded transition-colors ml-4";
      reloadBtn.textContent = "🔄 Reload";
      reloadBtn.addEventListener("click", () => {
        // Clear existing dynamic sounds
        const dynamicSounds = existingControls.querySelectorAll(
          '[data-sound-id^="seamless_"]'
        );
        dynamicSounds.forEach((sound) => sound.remove());

        // Reload sounds
        this.seamlessSounds.clear();
        this.loadSeamlessSoundsFromFolder();
      });

      header.appendChild(reloadBtn);
    }

    console.log(`Adding ${this.seamlessSounds.size} seamless sounds to column`);

    // Add additional seamless sounds
    this.seamlessSounds.forEach((soundData, id) => {
      console.log(`Creating control for: ${soundData.name}`);
      const soundControl = this.createSeamlessControl(soundData);
      existingControls.appendChild(soundControl);
      console.log(`Added control for: ${soundData.name}`);
    });

    console.log(
      `✅ Added ${this.seamlessSounds.size} seamless sounds to existing column`
    );
  }

  // Create seamless sound control element
  createSeamlessControl(soundData) {
    const container = document.createElement("div");
    container.className =
      "audio-controls bg-gray-800 p-4 rounded-lg border border-green-700 mb-3";
    container.dataset.soundId = soundData.id;

    container.innerHTML = `
      <p class="text-sm font-semibold mb-2 text-green-300">${soundData.name}</p>
      <img id="seamlessPlayBtn_${soundData.id}" 
           class="playButton w-16 h-16 cursor-pointer hover:opacity-80 transition-opacity object-contain" 
           src="images/play3.png" alt="play-stop btn">
      <input type="range" id="seamlessVolumeSlider_${soundData.id}" 
             class="hidden w-full mt-2" min="0" max="1" step="0.1" value="${soundData.volume}">
    `;

    // Add event listeners
    const playBtn = container.querySelector(`#seamlessPlayBtn_${soundData.id}`);
    const volumeSlider = container.querySelector(
      `#seamlessVolumeSlider_${soundData.id}`
    );

    if (playBtn) {
      playBtn.addEventListener("click", () => {
        console.log(`Clicked play button for: ${soundData.name}`);
        this.toggleSeamlessSound(soundData.id);
      });
    }

    if (volumeSlider) {
      volumeSlider.addEventListener("input", (e) => {
        this.setSeamlessVolume(soundData.id, e.target.value);
      });
    }

    console.log(`Created control element for: ${soundData.name}`);
    return container;
  }

  // Toggle seamless sound play/stop
  toggleSeamlessSound(id) {
    const soundData = this.seamlessSounds.get(id);
    if (!soundData) return;

    if (soundData.isPlaying) {
      this.stopSeamlessSound(id);
    } else {
      this.playSeamlessSound(id);
    }
  }

  // Play seamless sound
  playSeamlessSound(id) {
    console.log(`Attempting to play seamless sound: ${id}`);
    const soundData = this.seamlessSounds.get(id);
    if (!soundData) {
      console.error(`Sound data not found for: ${id}`);
      return;
    }

    console.log(`Sound data found:`, soundData);

    // Create Howl instance if not exists
    if (!soundData.howlInstance) {
      console.log(`Creating Howl instance for: ${soundData.filePath}`);
      soundData.howlInstance = new Howl({
        src: [soundData.filePath],
        html5: true,
        loop: true,
        onload: () => {
          console.log(`✅ Seamless sound loaded: ${soundData.name}`);
        },
        onloaderror: (soundId, error) => {
          console.error(
            `❌ Failed to load seamless sound ${soundData.name}:`,
            error
          );
        },
        onplay: () => {
          console.log(`🎵 Started playing: ${soundData.name}`);
        },
        onstop: () => {
          console.log(`⏹️ Stopped playing: ${soundData.name}`);
        },
      });
    }

    const howl = soundData.howlInstance;
    console.log(`Howl instance:`, howl);

    const soundId = howl.play();
    console.log(`Play returned sound ID:`, soundId);

    soundData.isPlaying = true;
    soundData.currentSoundId = soundId;

    // Update UI
    this.updateSeamlessButtonState(id, "stop");
    this.addSeamlessToSidebar(id);

    // Fade in
    howl.fade(0, soundData.volume, 500, soundId);
    console.log(`✅ Successfully started playing: ${soundData.name}`);
  }

  // Stop seamless sound
  stopSeamlessSound(id) {
    const soundData = this.seamlessSounds.get(id);
    if (!soundData || !soundData.isPlaying) return;

    const howl = soundData.howlInstance;
    const soundId = soundData.currentSoundId;

    if (howl && soundId) {
      howl.fade(howl.volume(soundId), 0, 500, soundId);
      setTimeout(() => {
        howl.stop(soundId);
      }, 500);
    }

    soundData.isPlaying = false;
    soundData.currentSoundId = null;

    // Update UI
    this.updateSeamlessButtonState(id, "play");
    this.removeSeamlessFromSidebar(id);
  }

  // Update seamless button state
  updateSeamlessButtonState(id, state) {
    const playBtn = document.querySelector(`#seamlessPlayBtn_${id}`);
    const volumeSlider = document.querySelector(`#seamlessVolumeSlider_${id}`);

    if (!playBtn) return;

    const imagePath = state === "play" ? "images/play3.png" : "images/stop.png";
    this.setButtonImage(playBtn, imagePath);

    if (volumeSlider) {
      volumeSlider.classList.toggle("hidden", state === "play");
    }
  }

  // Set volume for seamless sound
  setSeamlessVolume(id, volume) {
    const soundData = this.seamlessSounds.get(id);
    if (!soundData || !soundData.isPlaying) return;

    const howl = soundData.howlInstance;
    const soundId = soundData.currentSoundId;

    if (howl && soundId) {
      howl.volume(volume, soundId);
    }
  }

  // Add seamless sound to sidebar
  addSeamlessToSidebar(id) {
    const soundData = this.seamlessSounds.get(id);
    if (!soundData) return;

    const sidebar = document.getElementById("activeTracks");
    if (!sidebar) return;

    // Remove "no sounds" message if present
    const noSoundsMsg = sidebar.querySelector(".text-gray-500");
    if (noSoundsMsg) {
      noSoundsMsg.remove();
    }

    // Create sidebar item
    const sidebarItem = document.createElement("div");
    sidebarItem.className =
      "flex items-center justify-between p-3 bg-gray-700 rounded mb-2";
    sidebarItem.dataset.soundId = id;

    sidebarItem.innerHTML = `
      <div class="flex-1">
        <p class="text-sm font-medium text-white">${soundData.name}</p>
        <p class="text-xs text-green-400">🔄 Seamless</p>
      </div>
      <div class="flex items-center space-x-2">
        <input type="range" class="w-20" min="0" max="1" step="0.1" value="${soundData.volume}">
        <button class="text-red-400 hover:text-red-300 text-sm">✕</button>
      </div>
    `;

    // Add event listeners
    const stopBtn = sidebarItem.querySelector("button");
    const volumeSlider = sidebarItem.querySelector('input[type="range"]');

    stopBtn.addEventListener("click", () => this.stopSeamlessSound(id));
    volumeSlider.addEventListener("input", (e) =>
      this.setSeamlessVolume(id, e.target.value)
    );

    sidebar.appendChild(sidebarItem);
    this.updateActiveCount();
  }

  // Remove seamless sound from sidebar
  removeSeamlessFromSidebar(id) {
    const sidebar = document.getElementById("activeTracks");
    if (!sidebar) return;

    const item = sidebar.querySelector(`[data-sound-id="${id}"]`);
    if (item) {
      item.remove();
    }

    // Show "no sounds" message if sidebar is empty
    if (sidebar.children.length === 0) {
      sidebar.innerHTML = `
        <div class="text-center text-gray-500 py-8">
          <p>No sounds playing</p>
          <p class="text-sm">Start playing sounds to see them here</p>
        </div>
      `;
    }

    this.updateActiveCount();
  }

  // Update active count
  updateActiveCount() {
    const activeCount = document.getElementById("activeCount");
    if (activeCount) {
      const playingSeamless = Array.from(this.seamlessSounds.values()).filter(
        (s) => s.isPlaying
      ).length;
      const existingActive = soundManager.activeSounds.size;
      activeCount.textContent = existingActive + playingSeamless;
    }
  }

  // Set button image (reuse existing method)
  setButtonImage(button, imagePath) {
    const img = new Image();
    img.onload = () => {
      button.src = imagePath;
    };
    img.onerror = () => {
      console.warn(`Failed to load image: ${imagePath}`);
    };
    img.src = imagePath;
  }

  // Stop all seamless sounds
  stopAllSeamlessSounds() {
    this.seamlessSounds.forEach((soundData, id) => {
      if (soundData.isPlaying) {
        this.stopSeamlessSound(id);
      }
    });
  }
}

// Initialize simple seamless loader
const simpleSeamlessLoader = new SimpleSeamlessLoader();

// ========================================
// EXISTING CODE CONTINUES BELOW
// ========================================
