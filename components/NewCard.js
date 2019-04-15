import React, { Component } from 'react';
import { KeyboardAvoidingView, Text, Button } from 'react-native';
import { connect } from 'react-redux';

import SharedTextInput from './Shared.TextInput';
import sharedStyles from '../styles/shared';
import { add_card_handler } from '../actions/cards'

import { purple } from '../utils/colors'


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
        const deckname = navigation.state.params.item
        add_card(deckname, question, answer)
        this.props.navigation.navigate('Deck', { item: deckname })
    }

    handle_change_text = (name, state_name) => {
        this.setState({ [state_name]: name.trim().toLowerCase() })
    }

    render() {
        const { navigation } = this.props
        const { error, error_text } = this.state
        const deck = navigation.state.params.item

        return (
            <KeyboardAvoidingView style={[sharedStyles.container, { justifyContent: 'center'}]}>
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
                    onChangeText={question => this.handle_change_text(question, 'question')}
                />

                <SharedTextInput
                    placeholder='Enter answer'
                    returnKeyType="go"
                    refValue={input => this.answerInput = input} 
                    onChangeText={answer => this.handle_change_text(answer, 'answer')}
                />

                <Button
                    color={purple}
                    title='Save card'
                    onPress={this._save_card}
                />
            </KeyboardAvoidingView>
        )
    }
}

const mapDispatchToProps = dispatch => {
    const add_card = (deckname, question, answer) => {
        return dispatch(add_card_handler({ deckname, question, answer }))
    }

    return {
        add_card
    }
}

export default connect(null, mapDispatchToProps)(NewCard)
