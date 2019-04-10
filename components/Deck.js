import React, { Component } from 'react';
import { View, Text } from 'react-native';

class Deck extends Component {
    render() {
        const { deck } = this.props

        return (
            <View>
                <Text>
                    Deck detail
                </Text>
            </View>
        )
    }
}

export default Deck
