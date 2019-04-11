import React, { Component } from 'react';
import { View, Text } from 'react-native';

class NewCard extends Component {
    
    render() {
        const { navigation } = this.props
        const deck = navigation.state.params.item

        return (
            <View>
                <Text>
                    {`Add card to ${deck}`} 
                </Text>
            </View>
        )
    }
}

export default NewCard
