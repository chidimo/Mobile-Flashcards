import React, { Component } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';

import decksStyles from '../styles/Decks';


class Decks extends Component {

    static navigationOptions = {
        title: 'Home'
    }

    render_deck = item => {

        let card_count

        if (item[1] === 0) card_count = 'No card'
        else card_count = `${item[1]} card${item[1] === 1 ? '' : 's'}`
        
        return (
            <TouchableOpacity
            style={decksStyles.itemContainer}
            onPress={() => this.props.navigation.navigate(
                'Deck', { item: item[0] }
                )}
                >
                <Text style={decksStyles.text}>{item[0].toUpperCase()}</Text>
                <Text style={decksStyles.text}>{card_count}</Text>
            </TouchableOpacity>
        )
    }


    render() {
        const { deck_obj } = this.props
        return(
            <View style={decksStyles.container}>
                <FlatList
                    data={deck_obj}
                    renderItem={ ({ item }) => (this.render_deck(item))}
                    keyExtractor={(item, index) => index.toString()}
                />
            </View>
        )
    }
}

const mapStateToProps = ({ decks, cards }) => {
    let deck_obj = []

    for (deck of decks) {
        let deck_cards_count = cards.filter(card => {return card.deckname === deck})[0].quiz.length
        deck_obj.push([deck, deck_cards_count])
    }
    return { deck_obj }
}

export default connect(mapStateToProps)(Decks)
