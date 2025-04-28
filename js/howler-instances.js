
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
playPauseBtn1.addEventListener("click", function () {
  if (sound1.playing()) {
    sound1.pause();
    playPauseBtn1.src = "images/play1.png"; // Change to play icon
  } else {
    sound1.play();
    playPauseBtn1.src = "images/stop.png"; // Change to pause icon
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
    sound2.pause();
    playPauseBtn2.src = "images/play2.png";
  } else {
    sound2.play();
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
    sound3.pause();
    playPauseBtn3.src = "images/play3.png";
  } else {
    sound3.play();
    playPauseBtn3.src = "images/stop-inf.png";
  }
});

volumeSlider3.addEventListener("input", function () {
  sound3.volume(volumeSlider3.value);
});
