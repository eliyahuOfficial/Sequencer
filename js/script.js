const notes = {
    "C4": 261.63,
    "Db4": 277.18,
    "D4": 293.66,
    "Eb4": 311.13,
    "E4": 329.63,
    "F4": 349.23,
    "Gb4": 369.99,
    "G4": 392.00,
    "Ab4": 415.30,
    "A4": 440,
    "Bb4": 466.16,
    "B4": 493.88,
    "C5": 523.25
}


const noteSelectsDiv = document.querySelector('#note-selects-div');

for (let i = 0; i <= 7; i++) {
    const select = document.createElement('select');
    select.id = `note ${i + 1}`;
    for (let j = 0; j < Object.keys(notes).length; j++) {
        const option = document.createElement('option');
        option.value = j;
        option.innerText = `${Object.keys(notes)[j]}`;
        select.appendChild(option);
        select.addEventListener('change', setCurrentNotes)
    }
    noteSelectsDiv.appendChild(select);
}

let currentNotes = [0, 2, 3, 7, 8, 7, 3, 2];



const noteSelects = document.querySelectorAll('select');

function setNoteSelects() {
    for (let i = 0; i < currentNotes.length; i++) {
        noteSelects[i].value = currentNotes[i];
    }
}

function setCurrentNotes() {
    for (let i = 0; i < noteSelects.length; i++) {
        currentNotes[i] = noteSelects[i].value;
    }
}

setNoteSelects();



var AudioContext = window.AudioContext ||
    window.webkitAudioContext;

const context = new AudioContext();
const masterVolume = context.createGain();
masterVolume.connect(context.destination);
masterVolume.gain.value = 0.2

const volumeControl = document.querySelector('#volume-control');

volumeControl.addEventListener('input', function () {
    masterVolume.gain.value = this.value;
});



const waveformSelect = document.getElementById('waveform-select');
let waveform = "sine";

function setWaveform() {
    waveform = waveformSelect.value;

    console.log("Selected waveform:", waveform);
}

waveformSelect.addEventListener('change', setWaveform);

let attackTime = 0.3;
let sustainLevel = 0.8;
let releaseTime = 0.3;
let noteLength = 1;

const attackControl = document.querySelector('#attack-control');
const releaseControl = document.querySelector('#release-control');
const noteLengthControl = document.querySelector('#note-length-control');

attackControl.addEventListener('input', function () {
    attackTime = Number(this.value);
});

releaseControl.addEventListener('input', function () {
    releaseTime = Number(this.value);
});

noteLengthControl.addEventListener('input', function () {
    noteLength = Number(this.value);
});


let vibratoSpeed = 10;
let vibratoAmount = 0;
const vibratoAmountControl = document.querySelector('#vibrato-amount-control');
const vibratoSpeedControl = document.querySelector('#vibrato-speed-control');

vibratoAmountControl.addEventListener('input', function () {
    vibratoAmount = this.value;
})

vibratoSpeedControl.addEventListener('input', function () {
    vibratoSpeed = this.value;
})


const delayAmountControl = document.querySelector('#delay-amount-control');
const delayTimeControl = document.querySelector('#delay-time-control');
const feedbackControl = document.querySelector('#feedback-control');
const delay = context.createDelay();
const feedback = context.createGain();
const delayAmountGain = context.createGain();

delayAmountGain.connect(delay)
delay.connect(feedback)
feedback.connect(delay)
delay.connect(masterVolume)


delay.delayTime.value = 0;
delayAmountGain.gain.value = 0;
feedback.gain.value = 0;

delayAmountControl.addEventListener('input', function () {
    delayAmountGain.value = this.value;
})

delayTimeControl.addEventListener('input', function () {
    delay.delayTime.value = this.value;
})

feedbackControl.addEventListener('input', function () {
    feedback.gain.value = this.value;
})



const startButton = document.querySelector('#start-button');
const stopButton = document.querySelector('#stop-button');
const tempoControl = document.querySelector('#tempo-control');
let tempo = 120.0;
let currentNoteIndex = 0;
let isPlaying = false;

tempoControl.addEventListener('input', function () {
    tempo = Number(this.value);
}, false);

startButton.addEventListener('click', function () {
    if (!isPlaying) {
        isPlaying = true;
        noteLoop();
    }
})

stopButton.addEventListener('click', function () {
    isPlaying = false;
})

function noteLoop() {
    const secondsPerBeat = 60.0 / tempo;
    if (isPlaying) {
        playCurrentNote();
        nextNote();
        window.setTimeout(function () {
            noteLoop();
        }, secondsPerBeat * 1000)
    };
}

function nextNote() {
    noteSelects[currentNoteIndex].style.background = "var(--btn-color)";
    if (noteSelects[currentNoteIndex - 1]) {
        noteSelects[currentNoteIndex - 1].style.background = "white";
    } else {
        noteSelects[7].style.background = "white"
    }
    currentNoteIndex++;
    if (currentNoteIndex === 8) {
        currentNoteIndex = 0;
    }
}

function playCurrentNote() {
    const osc = context.createOscillator();
    const noteGain = context.createGain();
    noteGain.gain.setValueAtTime(0, 0);
    noteGain.gain.linearRampToValueAtTime(sustainLevel, context.currentTime + noteLength * attackTime);
    noteGain.gain.setValueAtTime(sustainLevel, context.currentTime + noteLength - noteLength * releaseTime);
    noteGain.gain.linearRampToValueAtTime(0, context.currentTime + noteLength);

    lfoGain = context.createGain();
    lfoGain.gain.setValueAtTime(vibratoAmount, 0);
    lfoGain.connect(osc.frequency)

    lfo = context.createOscillator();
    lfo.frequency.setValueAtTime(vibratoSpeed, 0);
    lfo.start(0);
    lfo.stop(context.currentTime + noteLength);
    lfo.connect(lfoGain);

    osc.type = waveform;
    osc.frequency.setValueAtTime(Object.values(notes)[`${currentNotes[currentNoteIndex]}`], 0);
    osc.start(0);
    osc.stop(context.currentTime + noteLength);
    osc.connect(noteGain);

    noteGain.connect(masterVolume);
    noteGain.connect(delay);
}
