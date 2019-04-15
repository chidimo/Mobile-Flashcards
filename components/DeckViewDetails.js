import React from 'react';
import { View, Text } from 'react-native';

import sharedStyles from '../styles/shared';
import deckViewDetailsStyles from '../styles/DeckViewDetailsStyle';

const DeckViewDetails = ({ title, questions }) => {

    if (questions === 0) card_count = 'No card'
    else card_count = `${questions} Card${questions > 1 ? 's' : ''}`

    return (
        
        <View>
            <Text style={sharedStyles.headingText}>{title.toUpperCase()}</Text>
            <Text style={deckViewDetailsStyles.cardCountText}>{card_count}</Text>
        </View>
    )
}

export default DeckViewDetails
