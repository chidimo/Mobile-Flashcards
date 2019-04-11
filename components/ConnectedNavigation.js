import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, StatusBar } from 'react-native';
import { Constants } from 'expo';

import Navigation from './Navigation'

export const AppStatusBar = () => {

    return (
        <View style={{height: Constants.statusBarHeight}}>
            <StatusBar translucent barStyle='light-content' backgroundColor='blue' />
        </View>
    )
}

class ConnectedNavigation extends Component {

    render() {
        return(
            <Navigation />
        )
    }
}

export default connect()(ConnectedNavigation)
