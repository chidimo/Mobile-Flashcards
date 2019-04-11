import { AsyncStorage } from 'react-native';

import { ADD_NEW_DECK, GET_DECKS } from './types'

export const add_new_deck = ({name}) => {
    return {
        type: ADD_NEW_DECK,
        name,
    }
}

export const add_new_deck_handler = (info_object) => {
    const { name } = info_object

    return dispatch => {
        AsyncStorage.setItem(name, name)
        .then(dispatch(add_new_deck(info_object)))
    }
}

export const get_decks = (decks) => {
    return {
        type: GET_DECKS,
        decks
    }
}
