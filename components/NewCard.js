import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { connect } from 'react-redux';

import SharedTextInput from './Shared.TextInput';
import SharedButton from './Shared.Button';
import newCardStyles from '../styles/NewCard';
import sharedStyles from '../styles/shared';
import { add_card_handler } from '../actions/cards'


class NewCard extends Component {

    static navigationOptions = ({ navigation }) => {
        const title = `Add card to ${navigation.getParam('item').toUpperCase()}`
        return ({ title })
    }

    state = { question: '', answer: '', error: false, error_text: ''}

    _save_card = () => {
        const { question, answer } = this.state

        if (!question) {
            this.setState({ error: true, error_text: 'Question cannot be empty' })
            return
        }

        if (!answer) {
            this.setState({ error: true, error_text: 'Answer cannot be empty' })
            return
        }
        const { navigation, add_card } = this.props
        const deck = navigation.state.params.item
        add_card(deck, question, answer)
        this.props.navigation.navigate('Deck', { item: deck })
    }
    
    render() {
        const { navigation } = this.props
        const { error, error_text } = this.state
        const deck = navigation.state.params.item

        return (
            <View style={sharedStyles.container}>
                <Text style={sharedStyles.headingText}>
                    {`Add card to ${deck.toUpperCase()}`} 
                </Text>

                    {
                        error && (
                            <Text style={sharedStyles.errorText}>{error_text}</Text>
                        )
                    }

                <SharedTextInput
                    refValue='question'
                    onSubmitEditing={() => this.answerInput.focus()} 
                    placeholder='Enter question'
                    returnKeyType="next"
                    onChangeText={question => this.setState({ question: question.trim().toLowerCase() })}
                />

                <SharedTextInput
                    placeholder='Enter answer'
                    returnKeyType="go"
                    refValue={input => this.answerInput = input} 
                    onChangeText={answer => this.setState({ answer: answer.trim().toLowerCase() })}
                />

                <SharedButton label={'Save card'} onPress={this._save_card}/>
            </View>
        )
    }
}

const mapDispatchToProps = dispatch => {
    const add_card = (deck, question, answer) => {
        return dispatch(add_card_handler({ deck, question, answer }))
    }

    return {
        add_card
    }
}

export default connect(null, mapDispatchToProps)(NewCard)
