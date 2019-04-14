import { ADD_CARD, GET_CARDS } from '../actions/types';


export const cards = (state=[], action) => {
    switch (action.type) {

        case GET_CARDS:
            return action.cards

        case ADD_CARD:
            let q = { question: action.question, answer: action.answer}
            return state.concat([{ deckname: action.deckname, quiz: q }])

        default:
            return state
    }
}
