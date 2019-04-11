import React from 'react';
import { 
    createBottomTabNavigator,
    createStackNavigator,
    createAppContainer 
} from 'react-navigation';
import { Platform } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';

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
        Add: {
            screen: NewDeckStack,
            navigationOptions: {
                tabBarIcon: ({ tintColor }) => <FontAwesome name='plus-square' size={30} color={tintColor} />
            }
        },

        Decks: {
            screen: DeckStack,
            navigationOptions: {
                title: 'Home',
                tabBarIcon: ({ tintColor }) => <Ionicons name={Platform.OS === 'ios' ? 'ios-home' : 'md-home'} size={30} color={tintColor}/>
            }
        },
    },

    {
        tabBarOptions: {
            activeTintColor: 'black',
            labelStyle: {
                fontSize: 12,
            },
            style: {
                color: 'black',
                backgroundColor: '#2980b6',
            },
        }
    }
)

export default Navigation = createAppContainer(tabs)
