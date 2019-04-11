import { combineReducers } from 'redux';

import { decks } from './decks';
import { cards } from './cards';

export const reducer = combineReducers({
    decks,
    cards,
})
