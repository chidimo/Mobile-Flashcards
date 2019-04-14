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
            
            let updated_cards = cards.concat(
                { deckname: deck, quiz: { question, answer } }
            )

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
