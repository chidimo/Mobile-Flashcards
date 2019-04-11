import React, { Component } from 'react';
import { View, Text } from 'react-native';

class Quiz extends Component {
    
    render() {
        const { navigation } = this.props

        return (
            <View>
                <Text>
                    Quiz
                </Text>

                <Text>
                    {JSON.stringify(navigation)}
                </Text>
            </View>
        )
    }
}

export default Quiz
