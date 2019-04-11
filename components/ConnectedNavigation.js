import React, { Component } from 'react';
import { connect } from 'react-redux';

import { AsyncStorage } from 'react-native';


import Navigation from './Navigation'

class ConnectedNavigation extends Component {

    render() {
        return(
            <Navigation />
        )
    }
}

export default connect()(ConnectedNavigation)
