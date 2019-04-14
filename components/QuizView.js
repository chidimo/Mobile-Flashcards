import React, { Component } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux'

import sharedStyles from '../styles/shared';
import quizViewStyles from '../styles/QuizView';

import { green, red } from '../utils/colors'


class QuizView extends Component {

    state = { showAnswer: false, showBanner: true }

    toggle_answer = () => {
        this.setState({ showAnswer: true, showBanner: false })
    }

    get_next_question = (deckname, index, score, end, option) => {
        const { navigation, quizzes } = this.props
        if (option === 1) score += 1
        if (index + 1 === quizzes.length) end = true

        this.setState({ showAnswer: false, showBanner: true })
        navigation.navigate(
            'QuizView',
            { index: index+1, deckname, score: score, end })
    }

    render() {
        const { navigation, quizzes } = this.props
        const { showAnswer, showBanner } = this.state
        const index = navigation.getParam('index')
        const score = navigation.getParam('score')
        const end = navigation.getParam('end')
        const deckname = navigation.getParam('deckname')

        const quiz_count = quizzes.length
        const quiz = quizzes[index]
        const question_number = index + 1

        
        if (end) {
            return (
                <View style={sharedStyles.container}>
                    <Text style={sharedStyles.headingText}>
                        End of quiz
                    </Text>
                    <Text>
                        {`You scored ${score} out of ${quizzes.length}`}
                    </Text>
                </View>
            )
        }

        if (quiz === undefined) {
            return (
                <View style={sharedStyles.container}>
                    <Text style={sharedStyles.headingText}>You cannot take a quiz yet.</Text>
                </View>
            )
        }

        return (
            <View style={sharedStyles.container}>

                <Text>Score: {score}</Text>
                <Text>{`Question ${question_number} of ${quiz_count}`}</Text>
                <Text style={quizViewStyles.questionContainer}>{quiz.quizzes[0].question}</Text>

                {
                    showAnswer && (
                        <Text style={quizViewStyles.answerContainer}>{quiz.quizzes[0].answer}</Text>
                    )
                }

                {
                    showBanner && (
                        <TouchableOpacity
                            style={quizViewStyles.showAnswer}
                            onPress={() => this.toggle_answer()}
                        >
                                <Text style={quizViewStyles.showAnswerText}> View answer</Text>
                        </TouchableOpacity>
                    )
                }

                <View style={quizViewStyles.markContainer}>
                    <TouchableOpacity
                        style={[sharedStyles.opacityContainer, { backgroundColor: red}]}
                        onPress={() => this.get_next_question(deckname, index, score, end, option=0)}
                    >
                        <Text>Wrong</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[sharedStyles.opacityContainer, { backgroundColor: green}]}
                        onPress={() => this.get_next_question(deckname, index, score, end, option=1)}
                    >
                        <Text>Correct</Text>
                    </TouchableOpacity>
                </View>


            </View>
        )
    }
}


const mapStateToProps = ({ cards }, { navigation }) => {
    const deck_name = navigation.getParam('deckname')
    const quizzes = cards.filter(card => {return card.deckname === deck_name})

    return { quizzes }
}

export default connect(mapStateToProps)(QuizView)
