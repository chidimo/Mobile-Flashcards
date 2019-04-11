import React, { Component } from 'react';
import { connect } from 'react-redux';

import Navigation from './Navigation'

class ConnectedNavigation extends Component {

    render() {
        return(
            <Navigation />
        )
    }
}

export default connect()(ConnectedNavigation)
