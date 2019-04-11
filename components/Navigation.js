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
import Quiz from './Quiz';

import { white, purple } from '../utils/colors';

const DeckStack = createStackNavigator(
    {
        Decks: Decks,
        Deck: Deck,
        NewCard: NewCard,
        Quiz: Quiz
    },

    {
        defaultNavigationOptions: {
            headerStyle: {
                backgroundColor: white,
            },
            headerTintColor: purple,
            headerTitleStyle: {
                fontWeight: '200',
                fontSize: 16,
            },
        },
    }
)

const NewDeckStack = createStackNavigator(
    {
        Add: {
            screen: NewDeck
        },
    },

    {
        defaultNavigationOptions: {
            headerStyle: {
                backgroundColor: white,
            },
            headerTintColor: purple,
            headerTitleStyle: {
                fontWeight: '200',
                fontSize: 18,
            },
        },
    }
)

const tabs = createBottomTabNavigator(
    {
        Decks: {
            screen: DeckStack,
            navigationOptions: {
                title: 'Home',
                tabBarIcon: ({ tintColor }) => <Ionicons name={Platform.OS === 'ios' ? 'ios-home' : 'md-home'} size={30} color={tintColor}/>
            }
        },

        Add: {
            screen: NewDeckStack,
            navigationOptions: {
                tabBarIcon: ({ tintColor }) => <FontAwesome name='plus-square' size={30} color={tintColor} />
            }
        },
    },

    {
        tabBarOptions: {
            activeTintColor: purple,
            labelStyle: {
                fontSize: 12,
            },
            style: {
                color: white,
                backgroundColor: white,
            },
        }
    },    
)

export default Navigation = createAppContainer(tabs)
