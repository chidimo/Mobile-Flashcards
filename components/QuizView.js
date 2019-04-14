import React, { Component } from 'react';
import { Text, View, Button, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux'

import deckStyles from '../styles/Deck';
import sharedStyles from '../styles/shared';
import quizViewStyles from '../styles/QuizView';

import { green, white, purple } from '../utils/colors'


class QuizView extends Component {
    
    static navigationOptions = ({ navigation }) => {
        const title = navigation.getParam('deckname').toUpperCase()
        return ({ title: `${title} quiz` })
    }

    state = { showAnswer: false }

    toggle_answer = () => {
        this.setState((previous_state) => (
            {showAnswer: !previous_state.showAnswer}
        ))
    }

    get_next_question = (deckname, index, score, end, option) => {
        const { navigation, quizzes } = this.props
        if (option === 1) score += 1
        if (index + 1 === quizzes.length) end = true

        this.setState({ showAnswer: false })
        navigation.navigate(
            'QuizView', { index: index+1, deckname, score: score, end }
        )
    }

    render() {
        const { navigation, quizzes } = this.props
        const { showAnswer } = this.state
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
                    <Text style={quizViewStyles.statsText}>
                        {`You scored ${score} out of ${quizzes.length}`}
                    </Text>

                    <View style={quizViewStyles.quizMenuContainer}>
                        <Button
                            title='Restart Quiz'
                            onPress={() => this.props.navigation.navigate(
                                'QuizView', { index: 0, score: 0, deckname: deckname, end: false }
                            )}
                        />
    
                        <Button
                            color={purple}
                            title='Back to Deck'
                            onPress={() => this.props.navigation.navigate(
                                'Deck', { item: deckname}
                            )}
                        />
                    </View>
                </View>
            )
        }

        if (quiz === undefined) {
            return (
                <View style={sharedStyles.container}>
                    <Text style={sharedStyles.headingText}>Quiz unavailable</Text>
                    <Text style={sharedStyles.text}>You cannot take this quiz as there are no cards on this deck.</Text>

                    <TouchableOpacity
                        style={[deckStyles.addCardContainer, {marginTop: 50}]}
                        onPress={() => this.props.navigation.navigate(
                            'NewCard', { item: deckname }
                        )}
                    >
                    <Text style={deckStyles.addCardText}>Add a Card</Text>
                </TouchableOpacity>
                </View>
            )
        }

        return (
            <View style={sharedStyles.container}>

                <View style={quizViewStyles.statsContainer}>
                    <Text style={quizViewStyles.statsText}>Score: {score}</Text>
                    <Text style={quizViewStyles.statsText}>{`Question ${question_number} of ${quiz_count}`}</Text>
                </View>


                <View style={quizViewStyles.questionContainer}>
                    <Text style={quizViewStyles.questionText}>{quiz.quizzes[0].question}</Text>
                </View>


                <View style={[quizViewStyles.answerContainer, {backgroundColor: showAnswer ? white : green}]}>
                    <Text style={quizViewStyles.answerText}>{quiz.quizzes[0].answer}</Text>
                </View>


                <View style={quizViewStyles.toggleAnswerContainer}>
                    <Button
                        color={purple}
                        title='Toggle answer'
                        style={quizViewStyles.toggleAnswerText}
                        onPress={() => this.toggle_answer()}
                    />                        
                </View>


                <View style={quizViewStyles.answerButtonsContainer}>
                    <Button
                        title="Incorrect"
                        onPress={() => this.get_next_question(deckname, index, score, end, option=0)}
                    />

                    <Button
                        title="Correct"
                        color={purple}
                        onPress={() => this.get_next_question(deckname, index, score, end, option=1)}
                    />
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
