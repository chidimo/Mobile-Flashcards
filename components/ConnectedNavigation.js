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

        AsyncStorage.getItem('store')
        .then(JSON.parse)
        .then(store => {
            const decks = Object.keys(store)
            dispatch(get_decks(decks))
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
