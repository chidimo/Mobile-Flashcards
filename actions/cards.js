import { AsyncStorage } from 'react-native';

import { ADD_CARD } from './types'

export const add_card = ({ deck, question, answer }) => {
    const key = `${deck}:cards`
    return {
        type: ADD_CARD,
        key,
        question,
        answer,
    }
}

export const add_card_handler = (info_object) => {
    const { deck, question, answer } = info_object
    const key = `${deck}:cards`
    return dispatch => {
        AsyncStorage.setItem(key, JSON.stringify({ question, answer }))
        .then(dispatch(add_card(info_object)))
    }
}
