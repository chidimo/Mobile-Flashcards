import React, { Component } from 'react';
import { View, Text } from 'react-native';

class Deck extends Component {
    render() {
        const { navigation } = this.props

        return (
            <View>
                <Text>
                    {navigation.state.params.item}
                </Text>
            </View>
        )
    }
}

export default Deck
