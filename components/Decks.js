import React, { Component } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';

import DeckViewDetails from './DeckViewDetails';
import decksStyles from '../styles/Decks';


class Decks extends Component {

    static navigationOptions = { title: 'Home' }

    render_deck = item => {

        return (
            <TouchableOpacity
            style={decksStyles.itemContainer}
            onPress={() => this.props.navigation.navigate(
                'Deck', { item: item[0] }
                )}
            >
                <DeckViewDetails title={item[0]} questions={item[1]} />
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
        let deck_cards_count = cards.filter(card => (card.deckname === deck)).length
        deck_obj.push([deck, deck_cards_count])
    }
    return { deck_obj }
}

export default connect(mapStateToProps)(Decks)
