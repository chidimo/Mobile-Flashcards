import { ADD_NEW_DECK, GET_DECKS, REMOVE_DECK, SET_DECK_KEY } from '../actions/types'

export const decks = (state={}, action) => {
    switch (action.type) {
        case SET_DECK_KEY:
            return state

        case ADD_NEW_DECK:
            return state.concat(action.name)

        case GET_DECKS:
            return action.decks

        case REMOVE_DECK:
            return state.filter((deck) => {
                return (deck !== action.name)
            })

        default:
            return state
    }
}
