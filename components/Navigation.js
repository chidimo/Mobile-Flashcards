// import React, { Component } from 'react';
import { createBottomTabNavigator, createStackNavigator, createAppContainer } from 'react-navigation';

import Decks from './Decks'
import NewDeck from './NewDeck'
import Deck from './Deck'
import NewCard from './NewCard';

const DeckStack = createStackNavigator(
    {
        Decks: {
            screen: Decks
        },

        Deck: {
            screen: Deck
        },

        NewCard: {
            screen: NewCard
        }
    }
)

const NewDeckStack = createStackNavigator(
    {
        Add: {
            screen: NewDeck
        },
    }
)

const tabs = createBottomTabNavigator(
    {
        Decks: {
            screen: DeckStack
        },

        Add: {
            screen: NewDeckStack
        }
    }
)


export default Navigation = createAppContainer(tabs)
