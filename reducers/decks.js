import { ADD_NEW_DECK, GET_DECKS } from '../actions/types'

export const decks = (state=[], action) => {
    switch (action.type) {
        case ADD_NEW_DECK:
            return state.concat(action.name)

        case GET_DECKS:
            return action.decks

        default:
            return state
    }
}
