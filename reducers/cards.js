import { SET_CARD_KEY, ADD_CARD, GET_CARDS } from '../actions/types';

export const cards = (state=[], action) => {
    switch (action.type) {
        case SET_CARD_KEY:
            return state

        case GET_CARDS:
            return action.cards

        case ADD_CARD:
            return action.updated_cards

        default:
            return state
    }
}
