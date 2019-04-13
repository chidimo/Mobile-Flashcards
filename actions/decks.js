import { AsyncStorage } from 'react-native';

import { ADD_NEW_DECK, GET_DECKS, REMOVE_DECK, SET_DECK_KEY } from './types'


export const set_deck_key = () => {
    return {
        type: SET_DECK_KEY
    }
}

export const set_deck_key_handler = () => {
    return dispatch => {
        AsyncStorage.getItem('decks', (err, result) => {
            if (!result) {
                AsyncStorage.setItem('decks', JSON.stringify([]))
                .then(dispatch(set_deck_key()))
            }
        })
    }
}

export const add_new_deck = ({name}) => {
    return {
        type: ADD_NEW_DECK,
        name,
    }
}

export const add_new_deck_handler = (info_object) => {
    const { name } = info_object

    return dispatch => {
        AsyncStorage.getItem('decks')
        .then(JSON.parse)
        .then(decks => {
            console.log('existing: ', decks)
            let updated_deck = decks.concat(name)
            AsyncStorage.setItem('decks', JSON.stringify(updated_deck))
            .then(dispatch(add_new_deck(info_object)))
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
            .then(dispatch(remove_deck(info_object)))
        })
    }
}
