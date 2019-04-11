import React, { Component } from 'react';
import { connect } from 'react-redux';

import { View, Text,   } from 'react-native';
import SharedTextInput from './Shared.TextInput'
import SharedButton from './Shared.Button'

import { add_new_deck_handler } from '../actions/decks'

// import newDeckStyles from '../styles/NewDeck'
import sharedStyles from '../styles/shared';

class NewDeck extends Component {

    state = { name: '' }

    _save_deck = () => {
        const { name } = this.state
        this.props.add_deck(name)
    }

    render() {
        return (
            <View style={sharedStyles.container}>
                <Text style={sharedStyles.headingText}>
                    Add new deck
                </Text>

                <SharedTextInput
                    returnKeyType="go"
                    placeholder={'Enter deck name'}
                    onChangeText={name => this.setState({name})}
                />

                <SharedButton
                    label={'Save deck'}
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
