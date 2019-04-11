import React, { Component } from 'react';
import { View, Text } from 'react-native';

import sharedStyles from '../styles/shared';

class Quiz extends Component {

    static navigationOptions = ({ navigation }) => {
        const title = `Quiz for deck ${navigation.getParam('item').toUpperCase()}`
        return ({ title })
    }
    
    render() {
        const { navigation } = this.props

        return (
            <View style={sharedStyles.container}>
                <Text style={sharedStyles.headingText}>
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
