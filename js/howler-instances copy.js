
// https://github.com/goldfire/howler.js

// Create Howl instance 1
const sound1 = new Howl({
  src: ["nogap_sounds/sound1.ogg"],
  loop: false, // Enable seamless looping
  html5: true // Ensures it works on mobile
});

// Get button reference
const playPauseBtn1 = document.getElementById("playBtn1");
const volumeSlider1 = document.getElementById("volumeSlider1");

// Toggle play/pause
// playPauseBtn1.addEventListener("click", function () {
//   if (sound1.playing()) {
//     sound1.pause();
//     playPauseBtn1.src = "images/play1.png"; // Change to play icon
//   } else {
//     sound1.play();
//     playPauseBtn1.src = "images/stop.png"; // Change to pause icon
//   }
// });

playPauseBtn1.addEventListener("click", function () {
  if (sound1.playing()) {
    const id = sound1._sounds[0]._id; // Get sound ID
    sound1.fade(sound1.volume(), 0, 1000, id); // Fade out
    setTimeout(() => {
      sound1.pause(); // Pause after fade
      sound1.volume(volumeSlider1.value); // Reset volume
      playPauseBtn1.src = "images/play1.png";
    }, 1000);
  } else {
    const id = sound1.play(); // Start playing and get ID
    sound1.volume(0, id); // Start from 0 volume
    sound1.fade(0, volumeSlider1.value, 1000, id); // Fade in
    playPauseBtn1.src = "images/stop.png";
  }
});

// Adjust volume based on slider
volumeSlider1.addEventListener("input", function () {
  sound1.volume(volumeSlider1.value);
});



// Create Howl instance 2
const sound2 = new Howl({
  src: ["nogap_sounds/sound2.ogg"],
  loop: false,
  html5: true
});

const playPauseBtn2 = document.getElementById("playBtn2");
const volumeSlider2 = document.getElementById("volumeSlider2");

playPauseBtn2.addEventListener("click", function () {
  if (sound2.playing()) {
    const id = sound2._sounds[0]._id; // Get sound ID
    sound2.fade(sound2.volume(), 0, 1000, id); // Fade out over 1s
    setTimeout(() => {
      sound2.pause(); // Pause after fade
      sound2.volume(volumeSlider2.value); // Reset to slider value
      playPauseBtn2.src = "images/play2.png";
    }, 1000);
  } else {
    const id = sound2.play(); // Start playing
    sound2.volume(0, id); // Start at 0 volume
    sound2.fade(0, volumeSlider2.value, 1000, id); // Fade in
    playPauseBtn2.src = "images/stop.png";
  }
});

volumeSlider2.addEventListener("input", function () {
  sound2.volume(volumeSlider2.value);
});



// Create Howl instance 3: Seemless loop with fade-in, fade-out
const sound3 = new Howl({
  src: ["nogap_sounds/sound3.ogg"],
  loop: true,
  html5: true
});

const playPauseBtn3 = document.getElementById("playBtn3");
const volumeSlider3 = document.getElementById("volumeSlider3");

playPauseBtn3.addEventListener("click", function () {
  if (sound3.playing()) {
    const id = sound3._sounds[0]._id; // Get sound ID
    sound3.fade(sound3.volume(), 0, 1000, id); // Fade out over 1s
    setTimeout(() => {
      sound3.pause(); // Pause after fade
      sound3.volume(volumeSlider3.value); // Reset volume
      playPauseBtn3.src = "images/play3.png";
    }, 1000);
  } else {
    const id = sound3.play(); // Start playing
    sound3.volume(0, id); // Start with 0 volume
    sound3.fade(0, volumeSlider3.value, 1000, id); // Fade in
    playPauseBtn3.src = "images/stop-inf.png";
  }
});

volumeSlider3.addEventListener("input", function () {
  sound3.volume(volumeSlider3.value);
});


// Handle "Stop All Sounds" button with fade out
const stopButton = document.querySelector(".stopbutton");

stopButton.addEventListener("click", function () {
  fadeOutAndStop(sound1, playPauseBtn1, "images/play1.png");
  fadeOutAndStop(sound2, playPauseBtn2, "images/play2.png");
  fadeOutAndStop(sound3, playPauseBtn3, "images/play3.png");
});

// Helper function to fade out and stop
function fadeOutAndStop(sound, button, playImage) {
  if (sound.playing()) {
    const id = sound._sounds[0]._id; // Get current sound ID
    sound.fade(sound.volume(), 0, 1000, id); // Fade over 1 second
    setTimeout(() => {
      sound.stop();
      sound.volume(1); // Reset volume for next play
      if (button) {
        button.src = playImage; // Reset button icon
      }
    }, 1000); // After fade completes
  }
}