import React, { Component } from 'react';
import { View, Text } from 'react-native';

import SharedTextInput from './Shared.TextInput';
import SharedButton from './Shared.Button';
import newCardStyles from '../styles/NewCard';
import sharedStyles from '../styles/shared';


class NewCard extends Component {

    state = { question: '', answer: ''}

    _save_card = () => {
        console.log('save card')
        const { question, answer } = this.state
        const { navigation } = this.props
        const deck = navigation.state.params.item
        console.log('d: ', deck, 'q: ', question, 'a: ', answer)
    }
    
    render() {
        const { navigation } = this.props
        const deck = navigation.state.params.item

        return (
            <View style={sharedStyles.container}>
                <Text style={sharedStyles.headingText}>
                    {`Add card to ${deck}`} 
                </Text>

                <SharedTextInput
                    refValue='question'
                    onSubmitEditing={() => this.answerInput.focus()} 
                    placeholder={'Question'}
                    returnKeyType="next"
                    onChangeText={question => this.setState({question})}
                />

                <SharedTextInput
                    placeholder='Answer'
                    returnKeyType="go"
                    refValue={input => this.answerInput = input} 
                    onChangeText={answer => this.setState({answer})}
                />

                <SharedButton label={'Save card'} onPress={this._save_card}/>
            </View>
        )
    }
}

export default NewCard
