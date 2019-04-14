import React, { Component } from 'react';
import { Text, View, Button } from 'react-native';
import { connect } from 'react-redux'

import deckStyles from '../styles/Deck';
import sharedStyles from '../styles/shared';
import quizViewStyles from '../styles/Quiz';

import { green, white, purple } from '../utils/colors'
import { clearLocalNotification, setLocalNotification} from '../utils/notificationSystem'


class Quiz extends Component {
    
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
            'Quiz', { index: index+1, deckname, score: score, end }
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
            clearLocalNotification()
            .then(setLocalNotification)

            return (
                <View style={[sharedStyles.container, { flex: 1, justifyContent: 'space-evenly'}]}>
                    <Text style={sharedStyles.headingText}>
                        End of quiz
                    </Text>
                    <Text style={quizViewStyles.finalScoreText}>
                        {`You scored ${score} out of ${quizzes.length}`}
                    </Text>

                    <View style={quizViewStyles.quizMenuContainer}>
                        <Button
                            title='Restart Quiz'
                            onPress={() => this.props.navigation.navigate(
                                'Quiz', { index: 0, score: 0, deckname: deckname, end: false }
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
                <View style={[sharedStyles.container, { flex: 1, justifyContent: 'space-evenly'}]}>
                    <Text style={sharedStyles.headingText}>Quiz unavailable</Text>
                    <Text style={sharedStyles.text}>
                        You cannot take this quiz as there are no cards on this deck.
                    </Text>

                    <View style={[deckStyles.addCardContainer, {marginTop: 50}]}>
                        <Button
                            color={green}
                            title='Add Card'
                            onPress={() => this.props.navigation.navigate(
                                'NewCard', { item: deckname }
                            )}
                        />
                    </View>
                </View>
            )
        }

        return (
            <View style={[sharedStyles.container, { flex: 1, justifyContent: 'space-evenly'}]}>

                <View style={quizViewStyles.statsContainer}>
                    <Text style={quizViewStyles.statsText}>{`Question ${question_number} of ${quiz_count}`}</Text>
                </View>


                <View style={quizViewStyles.questionContainer}>
                    <Text style={quizViewStyles.questionText}>{quiz.quiz.question}</Text>
                </View>

                <View style={[quizViewStyles.answerContainer, {backgroundColor: showAnswer ? white : green}]}>
                    <Text style={quizViewStyles.answerText}>{quiz.quiz.answer}</Text>
                </View>

                <View>
                    <Button
                        color={purple}
                        title='Toggle answer'
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

export default connect(mapStateToProps)(Quiz)
