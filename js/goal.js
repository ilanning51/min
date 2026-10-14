/*
An optional goal for the current session. Nothing is shown until the user opens the prompt with the "setGoal" shortcut;
the goal then appears quietly in the toolbar, and clicking it marks it as done.
Goals aren't saved, so each launch starts fresh.
*/

var webviews = require('webviews.js')
var keybindings = require('keybindings.js')
var uiSounds = require('uiSounds.js')
var tabEditor = require('navbar/tabEditor.js')

const goal = {
  prompt: document.getElementById('goal-prompt'),
  input: document.getElementById('goal-input'),
  pill: document.getElementById('goal-pill'),
  text: '',
  isShown: false,
  show: function () {
    if (goal.isShown) {
      return
    }
    goal.isShown = true
    uiSounds.play('pop')

    tabEditor.hide()

    webviews.requestPlaceholder('goal')
    document.body.classList.add('is-goal-mode')

    goal.prompt.hidden = false
    goal.input.value = goal.text
    goal.input.focus()
    goal.input.select()
  },
  hide: function () {
    if (!goal.isShown) {
      return
    }
    goal.isShown = false

    goal.prompt.hidden = true
    document.body.classList.remove('is-goal-mode')
    webviews.hidePlaceholder('goal')
  },
  set: function (text) {
    goal.text = text.trim()
    goal.pill.classList.remove('done')
    goal.pill.textContent = goal.text
    goal.pill.hidden = !goal.text
  },
  complete: function () {
    if (!goal.text || goal.pill.classList.contains('done')) {
      return
    }
    uiSounds.play('complete')
    goal.text = ''
    goal.pill.classList.add('done')
    goal.pill.textContent = l('goalDone')

    setTimeout(function () {
      // a new goal may have been set in the meantime
      if (!goal.text) {
        goal.pill.hidden = true
        goal.pill.classList.remove('done')
      }
    }, 1600)
  },
  initialize: function () {
    goal.input.placeholder = l('goalPrompt')
    goal.pill.title = l('goalPillTitle')

    goal.input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        goal.set(goal.input.value)
        uiSounds.play(goal.text ? 'navigate' : 'dismiss')
        goal.hide()
      } else if (e.key === 'Escape') {
        uiSounds.play('dismiss')
        goal.hide()
      }
    })

    // clicking anywhere else cancels
    goal.input.addEventListener('blur', function () {
      goal.hide()
    })

    goal.pill.addEventListener('click', goal.complete)

    keybindings.defineShortcut('setGoal', function () {
      goal.show()
    })
  }
}

module.exports = goal
