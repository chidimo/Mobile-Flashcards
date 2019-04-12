import { AsyncStorage } from 'react-native';

import { ADD_NEW_DECK, GET_DECKS, REMOVE_DECK } from './types'

export const add_new_deck = ({name}) => {
    return {
        type: ADD_NEW_DECK,
        name,
    }
}

export const add_new_deck_handler = (info_object) => {
    const { name } = info_object

    return dispatch => {
        AsyncStorage.setItem(name, '')
        .then(dispatch(add_new_deck(info_object)))
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
        AsyncStorage.removeItem(name)
        .then(dispatch(remove_deck(info_object)))
    }
}
