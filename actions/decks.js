import { AsyncStorage } from 'react-native';

import { ADD_NEW_DECK, GET_DECKS, REMOVE_DECK } from './types'

export const add_new_deck = ({ name }) => {
    return {
        type: ADD_NEW_DECK,
        name,
    }
}

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

export const get_decks = (decks) => {
    return {
        type: GET_DECKS,
        decks
    }
}

export const remove_deck = ({ name }) => {
    return {
        type: REMOVE_DECK,
        name,
    }
}

export const remove_deck_hander = (info_object) => {
    const { name } = info_object

    return dispatch => {
        AsyncStorage.getItem('decks')
        .then(JSON.parse)
        .then(decks => {
            let updated_deck = decks.filter((deck) => {
                return deck !== name
            })
            AsyncStorage.setItem('decks', JSON.stringify(updated_deck))
            .then(() => {
                dispatch(remove_deck(info_object))
                // Now remove associated cards
                AsyncStorage.getItem('cards')
                .then(JSON.parse)
                .then(cards => {  
                    // Filter for cards to keep
                    let cards_to_keep = cards.filter(card => (card.deckname !== name))
                    AsyncStorage.setItem('cards', JSON.stringify(cards_to_keep))
                    .then(JSON.parse)
                    .then(console.log('Deck and associated cards removed successfully'))
                })
            })
        })
    }
}
