import React, { Component } from 'react';
import { View, Text,   } from 'react-native';
import { connect } from 'react-redux';

import SharedTextInput from './Shared.TextInput'
import SharedButton from './Shared.Button'
import { add_new_deck_handler } from '../actions/decks'
import sharedStyles from '../styles/shared';


class NewDeck extends Component {

    static navigationOptions = {
        title: 'Add deck'
    }

    state = { name: '', error: false }

    _save_deck = () => {
        const { name } = this.state

        if (!name) {
            this.setState({ error: true })
            return
        }
        
        this.props.add_deck(name)
        this.props.navigation.navigate('Decks')
    }

    render() {
        const { error } = this.state
        return (
            <View style={sharedStyles.container}>
                <Text style={sharedStyles.headingText}>
                    Add new deck
                </Text>

                {
                    error && (
                        <Text style={sharedStyles.errorText}>You must enter a deck name</Text>
                    )
                }

                <SharedTextInput
                    returnKeyType="go"
                    placeholder='Enter deck name'
                    onChangeText={name => this.setState({ name: name.trim().toLowerCase()})}
                />

                <SharedButton
                    label='Save deck'
                    onPress={this._save_deck}
                />
            </View>
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

export default connect(null, mapDispatchToProps)(NewDeck);
