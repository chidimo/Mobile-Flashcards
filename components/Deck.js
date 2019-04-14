import React, { Component } from 'react';
import { View, Text, Button, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';

import deckStyles from '../styles/Deck';
import sharedStyles from '../styles/shared';
import { remove_deck_hander } from '../actions/decks';
import { purple, green, red } from '../utils/colors';

class Deck extends Component {
    
    static navigationOptions = ({ navigation }) => {
        const title = navigation.getParam('item').toUpperCase()
        return ({ title })
    }
    
    render() {
        let card_count
        const { navigation, remove_deck, quizzes } = this.props
        const quiz_count = quizzes.length
        const item = navigation.state.params.item

        if (quiz_count === 0) card_count = 'No card'
        else card_count = `${quiz_count} card${quiz_count > 1 ? 's' : ''}`

        return (
            <View style={[sharedStyles.container, {justifyContent: 'space-evenly'}]}>

                <View>
                    <Text style={sharedStyles.headingText}>{item.toUpperCase()}</Text>
                    <Text style={deckStyles.cardCountText}>{card_count}</Text>
                </View>

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
                            onPress={() => {remove_deck(item); navigation.navigate('Decks')}}
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
    const remove_deck = name => {
        dispatch(remove_deck_hander({ name }))
    }

    return {
        remove_deck
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Deck)
