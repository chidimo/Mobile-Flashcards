import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, StatusBar, AsyncStorage } from 'react-native';
import { Constants } from 'expo';

import Navigation from './Navigation'
import { set_deck_key_handler } from '../actions/decks'
import { set_card_key_handler } from '../actions/cards'


export const AppStatusBar = () => {

    return (
        <View style={{height: Constants.statusBarHeight}}>
            <StatusBar translucent barStyle='light-content' backgroundColor='blue' />
        </View>
    )
}

class ConnectedNavigation extends Component {

    componentDidMount() {
        const { set_deck_key, set_card_key } = this.props
        set_card_key()
        set_deck_key()

        AsyncStorage.getAllKeys()
        .then(keys => console.log('all keys: ', keys))
    }

    render() {
        return(
            <Navigation />
        )
    }
}

const mapDispatchToProps = dispatch => {
    const set_deck_key = () => {
        dispatch(set_deck_key_handler())
    }
    const set_card_key = () => {
        dispatch(set_card_key_handler())
    }

    return { set_deck_key, set_card_key }
}

export default connect(null, mapDispatchToProps)(ConnectedNavigation)
