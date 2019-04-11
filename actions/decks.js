import { AsyncStorage } from 'react-native';
// import AsyncStorage from '@react-native-community/async-storage';

import { ADD_NEW_DECK } from './types'

export const add_new_deck = ({name}) => {
    return {
        type: ADD_NEW_DECK,
        name,
    }
}

export const add_new_deck_handler = (info_object) => {
    const { name } = info_object

    return dispatch => {
        // save deck in async storage
        AsyncStorage.setItem(name, name)
        .then(dispatch(add_new_deck(info_object)))
    }
}
