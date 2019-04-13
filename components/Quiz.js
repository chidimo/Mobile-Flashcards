import React, { Component } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';

import sharedStyles from '../styles/shared';


class Quiz extends Component {

    static navigationOptions = ({ navigation }) => {
        const title = `Take ${navigation.getParam('item').toUpperCase()} quiz`
        return ({ title })
    }

    render_quiz = (item, index, total) => {
        // console.log(' total; ', total)
        // console.log(' itemd; ', item)
        console.log(' index; ', index)
        console.log(' index; ', JSON.stringify(item))
        console.log('******************************')

        return (
            <View>
                <Text>
                    {`Question ${index} of ${total}`}
                </Text>

                <Text>
                    {item.quizzes[0].question}
                </Text>

                <TouchableOpacity>
                    <Text>
                        Show answer
                    </Text>
                </TouchableOpacity>
            </View>
        )

    }
    
    render() {
        const { navigation, quizzes } = this.props
        const total = quizzes.length

        return (
            <View style={sharedStyles.container}>
                <Text style={sharedStyles.headingText}>
                    Quiz
                </Text>

                {/* <Text>
                    {JSON.stringify(quizzes)}
                </Text> */}

                <FlatList
                    data={quizzes}
                    renderItem={ ({ item, index }) => (this.render_quiz(item, index, total))}
                    keyExtractor={(item, index) => index.toString()}
                />
{/* 
                <Text>
                    {JSON.stringify(navigation)}
                </Text> */}
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
