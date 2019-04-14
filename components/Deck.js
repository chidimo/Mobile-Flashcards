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
        const { navigation, remove_deck, quizzes } = this.props
        const quiz_count = quizzes.length
        const item = navigation.state.params.item

        return (
            <View style={sharedStyles.container}>

                <Text style={sharedStyles.headingText}>{item.toUpperCase()}</Text>
                <Text>{`${quiz_count} cards`}</Text>

                <TouchableOpacity
                    style={deckStyles.beginQuizContainer}
                    onPress={() => this.props.navigation.navigate(
                        'QuizView', { index: 0, score: 0, deckname: item, end: false }
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
                    onPress={() => {remove_deck(item); navigation.navigate('Decks')}}
                >
                    <Text style={deckStyles.removeDeckText}>Delete</Text>
                </TouchableOpacity>
            </View>
        )
    }
}

const mapStateToProps = ({ cards }, { navigation }) => {
    const deck_name = navigation.getParam('item')
    const quizzes = cards.filter(card => {return card.deckname === deck_name})

    return { quizzes }
}

const mapDispatchToProps = dispatch => {
    const remove_deck = name => {
        dispatch(remove_deck_hander({ name }))
    }

    return {
        remove_deck
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Deck)
