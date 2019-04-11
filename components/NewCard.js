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

    state = { question: '', answer: ''}

    _save_card = () => {
        const { question, answer } = this.state
        const { navigation, add_card } = this.props
        const deck = navigation.state.params.item
        console.log('d: ', deck, 'q: ', question, 'a: ', answer)
        add_card(deck, question, answer)
    }
    
    render() {
        const { navigation } = this.props
        const deck = navigation.state.params.item

        return (
            <View style={sharedStyles.container}>
                <Text style={sharedStyles.headingText}>
                    {`Add card to ${deck.toUpperCase()}`} 
                </Text>

                <SharedTextInput
                    refValue='question'
                    onSubmitEditing={() => this.answerInput.focus()} 
                    placeholder='Enter question'
                    returnKeyType="next"
                    onChangeText={question => this.setState({question})}
                />

                <SharedTextInput
                    placeholder='Enter answer'
                    returnKeyType="go"
                    refValue={input => this.answerInput = input} 
                    onChangeText={answer => this.setState({answer})}
                />

                <SharedButton label={'Save card'} onPress={this._save_card}/>
            </View>
        )
    }
}

const mapDispatchToProps = dispatch => {
    const add_card = (deck, question, answer) => {
        // const question_answer = `${question}+${answer}`
        return dispatch(add_card_handler({ deck, question, answer }))
    }

    return {
        add_card
    }
}

export default connect(null, mapDispatchToProps)(NewCard)
