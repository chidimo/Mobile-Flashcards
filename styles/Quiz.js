import { StyleSheet } from 'react-native';
import { white, green, purple } from '../utils/colors'

export default quizViewStyles = StyleSheet.create({
    statsContainer: {
        borderRadius: 4,
        backgroundColor: purple,
    },
    statsText: {
        textAlign: 'center',
        fontSize: 18,
        color: purple,
    },

    questionContainer: {
        padding: 8,
        fontSize: 22,
        borderRadius: 4,
    },
    questionText: {
        color: purple,
        textAlign: 'center',
        fontSize: 28,
    },

    answerContainer: {
        padding: 8,
        fontSize: 22,
        borderRadius: 4,
    },
    answerText: {
        textAlign: 'center',
        color: green,
        fontSize: 28,
    },

    answerButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
    },
    showAnswerText: {
        textAlign: 'center',
    },


    quizMenuContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly'
    }
})
