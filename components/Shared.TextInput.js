import React, { Component } from 'react';
import { TextInput } from 'react-native'
import sharedTextInputStyles from '../styles/shared.TextInput';

class SharedTextInput extends Component {

    render() {
        const { refValue, ...props } = this.props
        
        return (
            <TextInput
                style={sharedTextInputStyles.textInput}
                ref={refValue}
                {...props}
            />
        )
    }
}

export default SharedTextInput
