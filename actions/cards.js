import { AsyncStorage } from 'react-native';

import { SET_CARD_KEY, ADD_CARD, GET_CARDS } from './types'

export const set_card_key = () => {
    return {
        type: SET_CARD_KEY
    }
}

export const set_card_key_handler = () => {
    return dispatch => {
        AsyncStorage.getItem('cards', (err, result) => {
            if (!result) {
                AsyncStorage.setItem('cards', JSON.stringify([]))
                .then(dispatch(set_card_key()))
            }
        })
    }
}

export const add_card = ({ updated_cards }) => {
    return {
        type: ADD_CARD,
        updated_cards,
    }
}

export const add_card_handler = (info_object) => {
    const { deck, question, answer } = info_object
    
    return dispatch => {
        AsyncStorage.getItem('cards')
        .then(JSON.parse)
        .then(cards => {
            
            let new_card
            let updated_cards
            // first filter for the current deckname in cards array
            let current_deck = cards.filter(card => {(card.deckname === deck)})[0]

            if (current_deck === undefined) {
                new_card = { deckname: deck, quizzes: [{ question, answer }] }
                updated_cards = cards.concat(new_card)
            }
            else {
                new_card = { question, answer }

                for (let card of cards) {
                    if (card.deckname === deck) card.quizzes.concat(new_card)
                }
                updated_cards = cards
            }

            AsyncStorage.setItem('cards', JSON.stringify(updated_cards))
            .then(JSON.parse)
            .then(data => {
                dispatch(add_card({ updated_cards }))
            })
        })
    }
}

export const get_cards = (cards) => {
    return {
        type: GET_CARDS,
        cards
    }
}
