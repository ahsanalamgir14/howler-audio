// https://github.com/goldfire/howler.js

const fadeDuration = 1000; // Duration for fade in/out in milliseconds
const sound3Duration = 2000; // Duration for sound3 in milliseconds
// -------------------------
// Sound 1
// -------------------------
let sound1Id = null;
const sound1 = new Howl({
  src: ["nogap_sounds/sound1.ogg"],
  loop: false,
  html5: true,
  onend: function () {
    playPauseBtn1.src = "images/play1.png";
    sound1Id = null;
  }
});

const playPauseBtn1 = document.getElementById("playBtn1");
const volumeSlider1 = document.getElementById("volumeSlider1");

playPauseBtn1.addEventListener("click", function () {
  if (sound1.playing()) {
    if (sound1Id !== null) {
      sound1.fade(sound1.volume(sound1Id), 0, fadeDuration, sound1Id);
      playPauseBtn1.src = "images/play1.png";
      volumeSlider1.classList.add("hidden"); // Hide slider
      setTimeout(() => {
        sound1.stop(sound1Id);
        sound1.volume(volumeSlider1.value, sound1Id);
        sound1Id = null;
      }, fadeDuration);
    }
  } else {
    sound1Id = sound1.play();
    sound1.volume(0, sound1Id);
    sound1.once("play", () => {
      sound1.fade(0, volumeSlider1.value, fadeDuration, sound1Id);
    });
    playPauseBtn1.src = "images/stop.png";
    volumeSlider1.classList.remove("hidden"); // Show slider
  }
});


volumeSlider1.addEventListener("input", function () {
  if (sound1Id !== null) {
    sound1.volume(volumeSlider1.value, sound1Id);
  }
});

// -------------------------
// Sound 2
// -------------------------
let sound2Id = null;
const sound2 = new Howl({
  src: ["nogap_sounds/sound2.ogg"],
  loop: false,
  html5: true,
  onend: function () {
    playPauseBtn2.src = "images/play2.png";
    sound2Id = null;
  }
});

const playPauseBtn2 = document.getElementById("playBtn2");
const volumeSlider2 = document.getElementById("volumeSlider2");

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
// Sound 3 (Looping)
// -------------------------
// let sound3Id = null;
// const sound3 = new Howl({
//   src: ["nogap_sounds/sound3.ogg"],
//   loop: true,
//   // Removed `html5: true` for seamless looping
// });

// const playPauseBtn3 = document.getElementById("playBtn3");
// const volumeSlider3 = document.getElementById("volumeSlider3");

// playPauseBtn3.addEventListener("click", function () {
//   if (sound3.playing()) {
//     if (sound3Id !== null) {
//       sound3.fade(sound3.volume(sound3Id), 0, fadeDuration, sound3Id);
//       setTimeout(() => {
//         sound3.stop(sound3Id);
//         sound3.volume(volumeSlider3.value, sound3Id);
//         playPauseBtn3.src = "images/play3.png";
//         sound3Id = null;
//       }, fadeDuration);
//     }
//   } else {
//     sound3Id = sound3.play();
//     sound3.volume(0, sound3Id);
//     sound3.once("play", () => {
//       sound3.fade(0, volumeSlider3.value, fadeDuration, sound3Id);
//     });
//     playPauseBtn3.src = "images/stop-inf.png";
//   }
// });

// volumeSlider3.addEventListener("input", function () {
//   if (sound3Id !== null) {
//     sound3.volume(volumeSlider3.value, sound3Id);
//   }
// });

const loop = new SeamlessLoop();
loop.addUri("nogap_sounds/sound3.ogg", sound3Duration, "sound3");

const playPauseBtn3 = document.getElementById("playBtn3");
const volumeSlider3 = document.getElementById("volumeSlider3");
let isPlaying = false;

playPauseBtn3.addEventListener("click", function () {
  if (!isPlaying) {
    loop.start("sound3");
    playPauseBtn3.src = "images/stop-inf.png";
    volumeSlider3.classList.remove("hidden"); // Show slider
    isPlaying = true;
  } else {
    loop.stop();
    playPauseBtn3.src = "images/play3.png";
    isPlaying = false;
    volumeSlider3.classList.add("hidden"); // Hide slider
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
    loop.stop();
    playPauseBtn3.src = "images/play3.png";
    volumeSlider3.classList.add("hidden");
    isPlaying = false;
    console.log("sound3 (SeamlessLoop) stopped.");
  }
});
