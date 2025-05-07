// https://github.com/goldfire/howler.js

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
      sound1.fade(sound1.volume(sound1Id), 0, 1000, sound1Id);
      // setTimeout(() => {
        sound1.stop(sound1Id);
        sound1.volume(volumeSlider1.value, sound1Id);
        playPauseBtn1.src = "images/play1.png";
        volumeSlider1.classList.add("hidden"); // Hide slider
        sound1Id = null;
      // }, 1000);
    }
  } else {
    sound1Id = sound1.play();
    sound1.volume(0, sound1Id);
    sound1.once("play", () => {
      sound1.fade(0, volumeSlider1.value, 1000, sound1Id);
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
      sound2.fade(sound2.volume(sound2Id), 0, 1000, sound2Id);
      // setTimeout(() => {
        sound2.stop(sound2Id);
        sound2.volume(volumeSlider2.value, sound2Id);
        playPauseBtn2.src = "images/play2.png";
        volumeSlider2.classList.add("hidden"); // Hide slider
        sound2Id = null;
      // }, 1000);
    }
  } else {
    sound2Id = sound2.play();
    sound2.volume(0, sound2Id);
    sound2.once("play", () => {
      sound2.fade(0, volumeSlider2.value, 1000, sound2Id);
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
//       sound3.fade(sound3.volume(sound3Id), 0, 1000, sound3Id);
//       setTimeout(() => {
//         sound3.stop(sound3Id);
//         sound3.volume(volumeSlider3.value, sound3Id);
//         playPauseBtn3.src = "images/play3.png";
//         sound3Id = null;
//       }, 1000);
//     }
//   } else {
//     sound3Id = sound3.play();
//     sound3.volume(0, sound3Id);
//     sound3.once("play", () => {
//       sound3.fade(0, volumeSlider3.value, 1000, sound3Id);
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
loop.addUri("nogap_sounds/sound3.ogg", 2200, "sound3");

loop.callback(() => {
  // Start the seamless loop
  loop.start("sound3");
});

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

stopButton.addEventListener("click", function () {
  console.log("Stop All Sounds button clicked.");
  
  fadeOutAndStop(sound1, playPauseBtn1, "images/play1.png", () => {
    console.log("sound1 stopped.");
    sound1Id = null;
    volumeSlider1.classList.add("hidden");
  });

  fadeOutAndStop(sound2, playPauseBtn2, "images/play2.png", () => {
    console.log("sound2 stopped.");
    sound2Id = null;
    volumeSlider2.classList.add("hidden");
  });

  if (isPlaying) {
    loop.stop();
    playPauseBtn3.src = "images/play3.png";
    volumeSlider3.classList.add("hidden");
    isPlaying = false;
    console.log("sound3 (SeamlessLoop) stopped.");
  }
});

function fadeOutAndStop(sound, button, playImage, onStop) {
  console.log("fadeOutAndStop called for sound:", sound);
  const activeSound = sound._sounds.find(s => s._playing);
  
  if (activeSound) {
    console.log("Found active sound:", activeSound);
    const id = activeSound._id;
    
    // Fade out the sound
    sound.fade(sound.volume(id), 0, 1000, id);
    setTimeout(() => {
      console.log("Stopping sound with ID:", id);
      sound.stop(id);
      sound.volume(1, id);  // Reset volume
      if (button) button.src = playImage;  // Update button image
      if (onStop) onStop();  // Execute callback
    }, 1000);
  } else {
    console.log("No active sound found for:", sound);
  }
}
