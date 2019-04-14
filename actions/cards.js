import { AsyncStorage } from 'react-native';

import { ADD_CARD, GET_CARDS } from './types'

export const add_card = ({ deckname, quiz }) => {
    return {
        type: ADD_CARD,
        deckname,
        quiz,
    }
}

export const add_card_handler = (info_object) => {
    const { deckname, question, answer } = info_object
    
    return dispatch => {
        AsyncStorage.getItem('store')
        .then(JSON.parse)
        .then(store => {
            store[deckname].questions.push({ question, answer })
            console.log('\n\nstore', JSON.stringify(store), '\n\n')

            AsyncStorage.setItem('store', JSON.stringify(store))
            .then(() => {
                const quiz = { question, answer }
                dispatch(add_card({ deckname, quiz }))
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
