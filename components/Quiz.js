import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { connect } from 'react-redux';

import sharedStyles from '../styles/shared';

class Quiz extends Component {

    static navigationOptions = ({ navigation }) => {
        const title = `Take ${navigation.getParam('item').toUpperCase()} quiz`
        return ({ title })
    }
    
    render() {
        const { navigation, quizzes } = this.props

        return (
            <View style={sharedStyles.container}>
                <Text style={sharedStyles.headingText}>
                    Quiz
                </Text>

                <Text>{JSON.stringify(quizzes)}</Text>

                <Text>
                    {JSON.stringify(navigation)}
                </Text>
            </View>
        )
    }
}

const mapStateToProps = ({ cards }, { navigation }) => {
    // console.log('nav ', navigation)
    const deck_name = navigation.getParam('item')
    const quizzes = cards.filter(card => {return card.deckname === deck_name})
    return {
        quizzes
    }
}

export default connect(mapStateToProps)(Quiz)
