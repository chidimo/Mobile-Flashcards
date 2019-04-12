import { ADD_CARD } from '../actions/types';

export const cards = (state={}, action) => {
    switch (action.type) {
        case ADD_CARD:
            return {
                ...state,
                [action.deck]: action.result
            }

        default:
            return state
    }
}
