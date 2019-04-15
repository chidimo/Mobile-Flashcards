import React, { Component } from 'react';
import { View, Text, Button } from 'react-native';
import { connect } from 'react-redux';

import DeckViewDetails from './DeckViewDetails';
import sharedStyles from '../styles/shared';
import { remove_deck_hander } from '../actions/decks';
import { purple, green, red } from '../utils/colors';

class Deck extends Component {
    
    static navigationOptions = ({ navigation }) => {
        const title = navigation.getParam('item').toUpperCase()
        return ({ title })
    }

    _remove_deck = (item) => {
        const { navigation, remove_deck } = this.props
        remove_deck(item)
        navigation.navigate('Decks')
    }
    
    render() {

        const { navigation, quizzes } = this.props
        const item = navigation.state.params.item

        return (
            <View style={[sharedStyles.container, {justifyContent: 'space-evenly'}]}>

                <DeckViewDetails title={item} questions={quizzes.length} />

                <View style={{flex: 1, justifyContent: 'space-evenly'}}>
                    <View>
                        <Button
                            title='Start quiz'
                            color={purple}
                            onPress={() => this.props.navigation.navigate(
                                'Quiz', { index: 0, score: 0, deckname: item, end: false }
                            )}
                        />
                    </View>
    
                    <View>
                        <Button
                            color={green}
                            title='Add Card'
                            onPress={() => this.props.navigation.navigate(
                                'NewCard', { item }
                            )}
                        />
                    </View>
    
                    <View>
                        <Button
                            title='Delete'
                            color={red}
                            onPress={() => this._remove_deck(item)}
                        />
                    </View>
                </View>

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
    const remove_deck = deckname => {
        dispatch(remove_deck_hander({ deckname }))
    }

    return {
        remove_deck
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Deck)
