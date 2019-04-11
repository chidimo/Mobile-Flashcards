import React from 'react';
import { Text, TouchableOpacity } from 'react-native'
import sharedButtonStyles from '../styles/Shared.Button';

const SharedButton = ({ label, onPress }) => {
    return (
        <TouchableOpacity
            style={[sharedButtonStyles.container]}
            onPress={onPress}
        >
            <Text style={sharedButtonStyles.text}>
                {label}
            </Text>
        </TouchableOpacity>
    )
}

export default SharedButton
