import { ADD_NEW_DECK, GET_DECKS, REMOVE_DECK, SET_DECK_KEY } from '../actions/types'

export const decks = (state=[], action) => {
    switch (action.type) {
        case SET_DECK_KEY:
            return state

        case GET_DECKS:
            return action.decks

        case ADD_NEW_DECK:
            return action.updated_deck

        case REMOVE_DECK:
            return state.filter((deck) => {
                return (deck !== action.name)
            })

        default:
            return state
    }
}
