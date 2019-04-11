import React, { Component } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

import deckStyles from '../styles/Deck';
import sharedStyles from '../styles/shared';

class Deck extends Component {
    
    static navigationOptions = ({ navigation }) => {
        const title = navigation.getParam('item').toUpperCase()
        return ({ title })
    }
    
    render() {
        const { navigation } = this.props
        const item = navigation.state.params.item

        return (
            <View style={sharedStyles.container}>
                <Text style={sharedStyles.headingText}>
                    {item.toUpperCase()}
                </Text>

                <TouchableOpacity
                    style={deckStyles.startQuizContainer}
                    onPress={() => this.props.navigation.navigate(
                        'Quiz', { item }
                    )}
                >
                    <Text style={deckStyles.startQuiztext}>Start quiz</Text>
                </TouchableOpacity>


                <TouchableOpacity
                    style={deckStyles.addCardContainer}
                    onPress={() => this.props.navigation.navigate(
                        'NewCard', { item }
                    )}
                >
                    <Text style={deckStyles.addCardText}>Add Card</Text>
                </TouchableOpacity>

            </View>
        )
    }
}

export default Deck
