import { AsyncStorage } from 'react-native';

import { ADD_CARD, GET_CARDS } from './types'

export const add_card = ({ deckname, question, answer }) => ({
    type: ADD_CARD,
    deckname,
    question,
    answer,
})

export const add_card_handler = (info_object) => {
    const { deckname, question, answer } = info_object

    return dispatch => {
        AsyncStorage.getItem('store')
        .then(JSON.parse)
        .then(store => {
            store[deckname].questions.push({ question, answer })

            AsyncStorage.setItem('store', JSON.stringify(store))
            .then(() => {
                dispatch(add_card({ deckname, question, answer }))
            })
        })
    }
}

export const get_cards = cards => ({
    type: GET_CARDS,
    cards
})
