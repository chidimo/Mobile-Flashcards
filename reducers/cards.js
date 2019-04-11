import { ADD_CARD } from '../actions/types';

export const cards = (state={}, action) => {
    switch (action.type) {
        case ADD_CARD:
            return {
                ...state,
                [action.question]: action.answer
            }

        default:
            return state
    }
}
