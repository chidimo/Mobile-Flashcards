import React, { Component } from 'react';
import { View, Text, AsyncStorage, FlatList, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';

import { get_decks } from '../actions/decks'
import decksStyles from '../styles/Decks';


class Decks extends Component {

    static navigationOptions = {
        title: 'Home'
    }

    render_deck = (item) => (
        <TouchableOpacity
            style={decksStyles.itemContainer}
            onPress={() => this.props.navigation.navigate(
                'Deck', { item }
            )}
        >
            <Text style={decksStyles.text}>{item.toUpperCase()}</Text>
        </TouchableOpacity>
    )

    render() {
        const { decks } = this.props
        return(
            <View style={decksStyles.container}>
                <FlatList
                    data={decks}
                    renderItem={ ({ item }) => (this.render_deck(item))}
                    keyExtractor={(item, index) => index.toString()}
                />
            </View>
        )
    }
}

const mapStateToProps = ({ decks }) => {
    return { decks }
}

export default connect(mapStateToProps)(Decks)
