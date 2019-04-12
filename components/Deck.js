import React, { Component } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';

import deckStyles from '../styles/Deck';
import sharedStyles from '../styles/shared';
import { remove_deck_hander } from '../actions/decks';

class Deck extends Component {
    
    static navigationOptions = ({ navigation }) => {
        const title = navigation.getParam('item').toUpperCase()
        return ({ title })
    }
    
    render() {
        const { navigation, remove_deck } = this.props
        const item = navigation.state.params.item
        console.log('items: ', item)

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

                <TouchableOpacity
                    style={deckStyles.removeDeckContainer}
                    onPress={() => remove_deck(item)}
                >
                    <Text style={deckStyles.removeDeckText}>Delete</Text>
                </TouchableOpacity>

            </View>
        )
    }
}

const mapDispatchToProps = dispatch => {
    const remove_deck = name => {
        dispatch(remove_deck_hander({ name }))
    }

    return {
        remove_deck
    }
}

export default connect(null, mapDispatchToProps)(Deck)
