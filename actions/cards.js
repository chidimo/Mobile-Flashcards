import { AsyncStorage } from 'react-native';

import { ADD_CARD, GET_CARDS } from './types'

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
