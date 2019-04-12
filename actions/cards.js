import { AsyncStorage } from 'react-native';

import { SET_CARD_KEY, ADD_CARD } from './types'

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

export const add_card = ({ deck, result }) => {
    return {
        type: ADD_CARD,
        deck,
        result,
    }
}

export const add_card_handler = (info_object) => {
    const { deck, question, answer } = info_object
    const card = { question, answer }

    // each key in AsyncStorage is the name of a deck
    // the value is a string which is formed by concatenating
    // stringified question and answer objects of the form
    // { question: 'some question', answer: 'some answer' }
    // the concatenating string is ":"

    return dispatch => {
        AsyncStorage.getItem(deck)
        .then(existing_card => {
            const updated_card = `${existing_card !== null ? existing_card : ''}${existing_card !== null ? ':' : ''}${JSON.stringify(card)}`
            AsyncStorage.setItem(deck, updated_card)
            .then(result => {
                console.log('result; ', result)
                dispatch(add_card({ deck, result }))
            })
        })
    }
}
