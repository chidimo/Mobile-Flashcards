import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text, StatusBar, AsyncStorage } from 'react-native';
import { Constants } from 'expo';

import { get_decks } from '../actions/decks';
import { get_cards } from '../actions/cards';

import Navigation from './Navigation'
import sharedStyles from '../styles/shared';
import { setLocalNotification } from '../utils/notificationSystem'


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
        setLocalNotification()

        const { dispatch } = this.props
        // AsyncStorage.clear().then(() => console.log('cleared'))

        AsyncStorage.getItem('store')
        .then(JSON.parse)
        .then(store => {
            let cards = []
            if (store === null) store = []
            const decks = Object.keys(store)

            for (deckname of decks) {
                for (question of store[deckname].questions) {
                    cards.push({ deckname, quiz: question})
                }
            }
            dispatch(get_decks(decks))
            dispatch(get_cards(cards))
            this.setState({ ready: true })
        })
        .catch(err => {
            console.log('catch error', err)
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
