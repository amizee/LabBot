/* global describe, it */
import { assert } from 'chai'
import minigameHandler from '../minigame.js'

let expected
let actual
let resultPromise

describe('Guess The Number test', () => {
  it('basic', async () => {
    resultPromise = minigameHandler.playGuessTheNumber()
    expected = 'Guess the number between 1-10'
    actual = await resultPromise
    assert.equal(expected, actual, 'Initialisation')

    minigameHandler.game.randomNumber = 5
    resultPromise = minigameHandler.play(5)
    expected = 'Congrats!'
    actual = await resultPromise
    assert.equal(expected, actual, 'Game result')
  })

  it('Out of bounds', async () => {
    minigameHandler.playGuessTheNumber()
    resultPromise = minigameHandler.play(0)
    expected = 'Choose between 1 - 10'
    actual = await resultPromise
    assert.equal(expected, actual, 'Smaller than lower bound')

    resultPromise = minigameHandler.play(11)
    actual = await resultPromise
    assert.equal(expected, actual, 'Larger than lower bound')
  })
})
