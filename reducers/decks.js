import { ADD_NEW_DECK, GET_DECKS, REMOVE_DECK, SET_DECK_KEY } from '../actions/types'

export const decks = (state=[], action) => {
    switch (action.type) {

        case GET_DECKS:
            return action.decks

        case ADD_NEW_DECK:
            return state.concat(action.name)

        case REMOVE_DECK:
            return state.filter(deck => (deck !== action.deckname))

        default:
            return state
    }
}
