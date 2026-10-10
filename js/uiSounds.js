/*
Short interface sounds, synthesized with the Web Audio API so no audio files are needed.
Each sound is a list of tones: [start offset (s), start frequency (Hz), end frequency (Hz), duration (s), volume, waveform]
*/

var settings = require('util/settings/settings.js')
var searchbar = require('searchbar/searchbar.js')

const sounds = {
  pop: [[0, 380, 1100, 0.07, 0.3, 'sine']],
  dismiss: [[0, 900, 420, 0.06, 0.16, 'sine']],
  navigate: [[0, 520, 1040, 0.09, 0.14, 'sine']],
  tabOpen: [[0, 660, 760, 0.05, 0.16, 'sine'], [0.05, 990, 1100, 0.07, 0.14, 'sine']],
  tabClose: [[0, 760, 620, 0.05, 0.14, 'sine'], [0.05, 520, 420, 0.07, 0.12, 'sine']],
  tabSwitch: [[0, 1800, 1600, 0.025, 0.06, 'triangle']],
  back: [[0, 900, 700, 0.04, 0.1, 'triangle']],
  forward: [[0, 700, 900, 0.04, 0.1, 'triangle']],
  bookmark: [[0, 1046, 1046, 0.12, 0.1, 'sine'], [0.06, 1568, 1568, 0.16, 0.08, 'sine']],
  complete: [[0, 523, 523, 0.14, 0.13, 'sine'], [0.08, 659, 659, 0.14, 0.12, 'sine'], [0.16, 784, 784, 0.14, 0.12, 'sine'], [0.24, 1047, 1047, 0.35, 0.12, 'sine']]
}

// sounds triggered by the same action (such as a new tab also opening the searchbar) shouldn't stack
const minimumGap = 70
// don't play sounds while the previous session is being restored
const startupDelay = 2000

let audioContext = null
let enabled = true
let lastPlayed = 0
const loadTime = Date.now()

function playTone ([offset, startFrequency, endFrequency, duration, volume, waveform]) {
  const start = audioContext.currentTime + offset

  const oscillator = audioContext.createOscillator()
  oscillator.type = waveform
  oscillator.frequency.setValueAtTime(startFrequency, start)
  oscillator.frequency.exponentialRampToValueAtTime(endFrequency, start + duration)

  const gain = audioContext.createGain()
  gain.gain.setValueAtTime(0, start)
  gain.gain.linearRampToValueAtTime(volume, start + 0.004)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)

  oscillator.connect(gain)
  gain.connect(audioContext.destination)
  oscillator.start(start)
  oscillator.stop(start + duration + 0.02)
}

const uiSounds = {
  play: function (name) {
    const now = Date.now()
    if (!enabled || !sounds[name] || !document.hasFocus() || now - loadTime < startupDelay || now - lastPlayed < minimumGap) {
      return
    }
    lastPlayed = now

    if (!audioContext) {
      audioContext = new window.AudioContext()
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume()
    }

    sounds[name].forEach(playTone)
  },
  initialize: function () {
    settings.listen('uiSounds', function (value) {
      enabled = value !== false
    })

    tasks.on('tab-added', () => uiSounds.play('tabOpen'))
    tasks.on('tab-destroyed', () => uiSounds.play('tabClose'))
    tasks.on('tab-selected', () => uiSounds.play('tabSwitch'))

    searchbar.events.on('url-selected', () => uiSounds.play('navigate'))
  }
}

module.exports = uiSounds
