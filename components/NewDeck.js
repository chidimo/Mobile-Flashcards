import React, { Component } from 'react';
import { View, Text, Button } from 'react-native';
import { connect } from 'react-redux';

import SharedTextInput from './Shared.TextInput'
import { add_new_deck_handler } from '../actions/decks'
import sharedStyles from '../styles/shared';
import { purple } from '../utils/colors';


class NewDeck extends Component {

    static navigationOptions = {
        title: 'Create deck'
    }

    state = { name: '', error: false }

    _save_deck = () => {
        const { name } = this.state

        if (!name) {
            this.setState({ error: true })
            return
        }
        
        this.props.add_deck(name)
        this.props.navigation.navigate('Deck', { item: name })
    }

    render() {
        const { error } = this.state
        return (
            <View style={sharedStyles.container}>
                <Text style={sharedStyles.headingText}>
                    Create deck
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

                <Button
                    color={purple}
                    title='Save deck'
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
