import React, { Component } from 'react';
import { View, Text } from 'react-native';

import deckStyles from '../styles/Deck';

class Deck extends Component {
    render() {
        const { navigation } = this.props

        return (
            <View style={deckStyles.container}>
                <Text style={deckStyles.headingText}>
                    {navigation.state.params.item}
                </Text>
            </View>
        )
    }
}

export default Deck
