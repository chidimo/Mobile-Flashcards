import { AsyncStorage } from 'react-native';

import { ADD_NEW_DECK, GET_DECKS, REMOVE_DECK } from './types'

export const add_new_deck = ({ name }) => ({
    type: ADD_NEW_DECK,
    name,
})

export const add_new_deck_handler = (info_object) => {
    const { name } = info_object

    return dispatch => {
        AsyncStorage.getItem('store')
        .then(JSON.parse)
        .then(store => {
            if (store === null) store = {} // for the store initiation
            if (name in store) return
            store[name] = { title: name, questions: []}
            AsyncStorage.setItem('store', JSON.stringify(store))
            .then(() => {
                dispatch(add_new_deck({ name }))
            })
        })
    }
}

export const get_decks = decks => ({
    type: GET_DECKS,
    decks
})

export const remove_deck = ({ deckname }) => ({
    type: REMOVE_DECK,
    deckname,
})

export const remove_deck_hander = (info_object) => {
    const { deckname } = info_object

    return dispatch => {
        AsyncStorage.getItem('store')
        .then(JSON.parse)
        .then(store => {
            delete store[deckname]
            AsyncStorage.setItem('store', JSON.stringify(store))
            .then(() => {
                dispatch(remove_deck(info_object))
            })
        })
    }
}
