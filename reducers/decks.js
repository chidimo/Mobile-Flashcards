import { ADD_NEW_DECK } from '../actions/types'

export const decks = (state={}, action) => {
    switch (action.type) {
        case ADD_NEW_DECK:
            return {
                ...state,
                [action.name]: action.name
            }

        default:
            return state
    }
}
