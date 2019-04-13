import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text, StatusBar, AsyncStorage } from 'react-native';
import { Constants } from 'expo';

import Navigation from './Navigation'
import { set_deck_key_handler, get_decks } from '../actions/decks'
import { set_card_key_handler, get_cards } from '../actions/cards'

import sharedStyles from '../styles/shared';


export const AppStatusBar = () => {

    return (
        <View style={{height: Constants.statusBarHeight}}>
            <StatusBar translucent barStyle='light-content' backgroundColor='blue' />
        </View>
    )
}

class ConnectedNavigation extends Component {

    state = { ready: false }

    componentDidMount() {
        const { dispatch } = this.props

        dispatch(set_deck_key_handler())
        dispatch(set_card_key_handler())

        AsyncStorage.getItem('decks')
        .then(JSON.parse)
        .then(decks => {
            dispatch(get_decks(decks))
            this.setState({ ready: true })
        })

        AsyncStorage.getItem('cards')
        .then(JSON.parse)
        .then(cards => {
            dispatch(get_cards(cards))
            this.setState({ ready: true })
        })

    }

    render() {
        const { ready } = this.state
        if (ready){
            return(
                <Navigation />
            )
        }

        return (
            <View style={[sharedStyles.container, {justifyContent: 'center'}]}>
                <Text style={sharedStyles.headingText}>
                    App loading
                </Text>
            </View>
        )
    }
}

export default connect()(ConnectedNavigation)
