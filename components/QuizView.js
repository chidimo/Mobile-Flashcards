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

    render() {
        const { navigation } = this.props
        const { showAnswer, showBanner } = this.state
        const quiz = navigation.getParam('quiz')
        const quiz_count = navigation.getParam('quiz_count')

        if (quiz === undefined) {
            return (
                <View>
                    <Text>You cannot take a quiz yet.</Text>
                </View>
            )
        }

        return (
            <View style={sharedStyles.container}>

                <Text>{`Question ${quiz_count} of ${quiz_count}`}</Text>
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
                    >
                        <Text>Wrong</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[sharedStyles.opacityContainer, { backgroundColor: green}]}
                    >
                        <Text>Correct</Text>
                    </TouchableOpacity>
                </View>


            </View>
        )
    }
}

export default connect()(QuizView)
