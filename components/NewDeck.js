import React, { Component } from 'react';
import { KeyboardAvoidingView, Text, Button } from 'react-native';
import { Header } from 'react-navigation';
import { Constants } from 'expo';
import { connect } from 'react-redux';

import SharedTextInput from './Shared.TextInput'
import { add_new_deck_handler } from '../actions/decks'
import sharedStyles from '../styles/shared';
import { purple } from '../utils/colors';


class NewDeck extends Component {

    static navigationOptions = { title: 'Create deck' }

    state = { name: '', error: false, error_text: '' }

    _save_deck = () => {
        const { name } = this.state
        const { decks } = this.props

        if (!name) {
            this.setState({ error: true, error_text: 'Please enter a deck name' })
            return
        }
        else if (decks.includes(name)) {
            this.setState({ error: true, error_text: 'This deck already exists'})
            return
        }
        
        this.props.add_deck(name)
        this.deckNameInput.clear()
        this.setState({ error: false })
        this.props.navigation.navigate('Deck', { item: name })
    }

    handle_change_text = (name) => {
        this.setState({ name: name.trim().toLowerCase() })
    }

    render() {
        const { error, error_text } = this.state
        return (
            <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset = {Header.HEIGHT + Constants.statusBarHeight} style={[sharedStyles.container, {justifyContent: 'center'}]}>
                <Text style={sharedStyles.headingText}>
                    Create deck
                </Text>

                {
                    error && (
                        <Text style={sharedStyles.errorText}>{error_text}</Text>
                    )
                }

                <SharedTextInput
                    returnKeyType="go"
                    placeholder='Enter deck name'
                    refValue={input => this.deckNameInput = input} 
                    onChangeText={name => this.handle_change_text(name)}
                />

                <Button
                    color={purple}
                    title='Save deck'
                    onPress={this._save_deck}
                />
            </KeyboardAvoidingView>
        )
    }
}

const mapDispatchToProps = dispatch => {
    const add_deck = name => {
        dispatch(add_new_deck_handler({name}))
    }

    return {
        add_deck
    }
}

const mapStateToProps = ({ decks }) => ({
    decks
})
export default connect(mapStateToProps, mapDispatchToProps)(NewDeck);
