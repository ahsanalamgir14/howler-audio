// https://github.com/goldfire/howler.js

const fadeDuration = 1000; // Duration for fade in/out in milliseconds
const sound3Duration = 2000; // Duration for sound3 in milliseconds

// -------------------------
const playPauseBtn1 = document.getElementById("playBtn1");
const volumeSlider1 = document.getElementById("volumeSlider1");

const playPauseBtn2 = document.getElementById("playBtn2");
const volumeSlider2 = document.getElementById("volumeSlider2");

// -------------------------
// Sound 1 (Bullet - Notification Sound)
// -------------------------
let sound1Id = null;
const sound1 = new Howl({
  src: ["nogap_sounds/dj-single.mp3"],
  loop: false,
  html5: true,
  onend: function () {
    playPauseBtn1.src = "images/play1.png";
    sound1Id = null;
    volumeSlider1.classList.add("hidden");
  },
});

playPauseBtn1.addEventListener("click", function () {
  // Only allow playing if not currently playing
  if (!sound1.playing()) {
    sound1Id = sound1.play();
    sound1.volume(0, sound1Id);
    sound1.once("play", () => {
      sound1.fade(0, volumeSlider1.value, fadeDuration, sound1Id);
    });
    playPauseBtn1.src = "images/stop.png";
    volumeSlider1.classList.remove("hidden"); // Show slider
  }
  // If already playing, do nothing - button is disabled until sound ends
});

volumeSlider1.addEventListener("input", function () {
  if (sound1Id !== null) {
    sound1.volume(volumeSlider1.value, sound1Id);
  }
});

// -------------------------
// Sound 2 (Charge)
// -------------------------
let sound2Id = null;
const sound2 = new Howl({
  src: ["nogap_sounds/sound2.ogg"],
  loop: false,
  html5: true,
  onend: function () {
    playPauseBtn2.src = "images/play2.png";
    sound2Id = null;
    volumeSlider2.classList.add("hidden");
  },
});

playPauseBtn2.addEventListener("click", function () {
  if (sound2.playing()) {
    if (sound2Id !== null) {
      sound2.fade(sound2.volume(sound2Id), 0, fadeDuration, sound2Id);
      playPauseBtn2.src = "images/play2.png";
      volumeSlider2.classList.add("hidden"); // Hide slider
      setTimeout(() => {
        sound2.stop(sound2Id);
        sound2.volume(volumeSlider2.value, sound2Id);
        sound2Id = null;
      }, fadeDuration);
    }
  } else {
    sound2Id = sound2.play();
    sound2.volume(0, sound2Id);
    sound2.once("play", () => {
      sound2.fade(0, volumeSlider2.value, fadeDuration, sound2Id);
    });
    playPauseBtn2.src = "images/stop.png";
    volumeSlider2.classList.remove("hidden"); // Show slider
  }
});

volumeSlider2.addEventListener("input", function () {
  if (sound2Id !== null) {
    sound2.volume(volumeSlider2.value, sound2Id);
  }
});

// -------------------------
// Sound 3 (Seamless Loop)
// -------------------------
const loop = new SeamlessLoop();
loop.addUri("nogap_sounds/sound3.ogg", sound3Duration, "sound3");

const playPauseBtn3 = document.getElementById("playBtn3");
const volumeSlider3 = document.getElementById("volumeSlider3");
let isPlaying = false;

playPauseBtn3.addEventListener("click", function () {
  if (!isPlaying) {
    // Start loop first before accessing volume
    loop.start("sound3");
    isPlaying = true;
    playPauseBtn3.src = "images/stop.png";
    volumeSlider3.classList.remove("hidden");

    // Wait a bit before fading in to ensure Howl is initialized
    setTimeout(() => {
      const targetVolume = parseFloat(volumeSlider3.value);
      const fadeSteps = 10;
      const interval = fadeDuration / fadeSteps;
      let step = targetVolume / fadeSteps;
      let current = 0;

      const fadeIn = setInterval(() => {
        current += step;
        if (current >= targetVolume) {
          loop.volume(targetVolume);
          clearInterval(fadeIn);
        } else {
          loop.volume(current);
        }
      }, interval);
    }, 200); // slight delay to ensure sound is loaded
  } else {
    // Fade out
    const currentVolume = parseFloat(volumeSlider3.value);
    const fadeSteps = 10;
    const interval = fadeDuration / fadeSteps;
    let step = currentVolume / fadeSteps;
    let current = currentVolume;

    const fadeOut = setInterval(() => {
      current -= step;
      if (current <= 0) {
        loop.volume(0);
        clearInterval(fadeOut);
        loop.stop();
        playPauseBtn3.src = "images/play3.png";
        volumeSlider3.classList.add("hidden");
        isPlaying = false;
        console.log("sound3 (SeamlessLoop) faded and stopped.");
      } else {
        loop.volume(current);
      }
    }, interval);
  }
});

volumeSlider3.addEventListener("input", function () {
  loop.volume(parseFloat(volumeSlider3.value));
});

// -------------------------
// Stop All Sounds Button
// -------------------------
const stopButton = document.querySelector(".stopbutton");
console.log("stopButton element:", stopButton);

stopButton.addEventListener("click", function () {
  console.log("Stop All Sounds button clicked.");

  // --- Sound 1 ---
  if (sound1Id !== null) {
    sound1.fade(sound1.volume(sound1Id), 0, fadeDuration, sound1Id);
    playPauseBtn1.src = "images/play1.png";
    volumeSlider1.classList.add("hidden");
    setTimeout(() => {
      sound1.stop(sound1Id);
      sound1Id = null;
      console.log("sound1 stopped.");
    }, fadeDuration);
  }

  // --- Sound 2 ---
  if (sound2Id !== null) {
    sound2.fade(sound2.volume(sound2Id), 0, fadeDuration, sound2Id);
    playPauseBtn2.src = "images/play2.png";
    volumeSlider2.classList.add("hidden");
    setTimeout(() => {
      sound2.stop(sound2Id);
      sound2Id = null;
      console.log("sound2 stopped.");
    }, fadeDuration);
  }

  if (isPlaying) {
    const currentVolume = parseFloat(volumeSlider3.value);
    const fadeSteps = 10;
    const interval = fadeDuration / fadeSteps;
    let step = currentVolume / fadeSteps;
    let current = currentVolume;

    const fadeOut = setInterval(() => {
      current -= step;
      if (current <= 0) {
        loop.volume(0);
        clearInterval(fadeOut);
        loop.stop();
        playPauseBtn3.src = "images/play3.png";
        volumeSlider3.classList.add("hidden");
        isPlaying = false;
        console.log("sound3 (SeamlessLoop) faded and stopped via Stop All.");
      } else {
        loop.volume(current);
      }
    }, interval);
  }
});
