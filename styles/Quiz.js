import { StyleSheet } from 'react-native';
import { white, green } from '../utils/colors'


export default quizViewStyles = StyleSheet.create({
    statsContainer: {
        marginTop: 20,
        borderRadius: 4,
        marginBottom: 4,     
        borderWidth: StyleSheet.hairlineWidth,
    },
    statsText: {
        textAlign: 'center',
        color: green,
        fontSize: 18,
    },

    questionContainer: {
        padding: 8,
        fontSize: 22,
        borderRadius: 4,
        marginBottom: 40,
        marginTop: 40,
        borderWidth: StyleSheet.hairlineWidth,
    },
    questionText: {
        color: green,
        textAlign: 'center',
        fontSize: 28,
    },

    answerContainer: {
        padding: 8,
        fontSize: 22,
        borderRadius: 4,
        borderWidth: StyleSheet.hairlineWidth,
    },
    answerText: {
        textAlign: 'center',
        color: green,
        fontSize: 28,
    },

    toggleAnswerContainer: {
        marginBottom: 20,
        marginTop: 20,
        borderRadius: 2,
        marginBottom: 30,
        borderColor: white,
        borderWidth: StyleSheet.hairlineWidth,
    },
    toggleAnswerText: {
        textAlign: 'center',
        fontSize: 20
    },

    answerButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
    },
    showAnswerText: {
        textAlign: 'center',
    },


    quizMenuContainer: {
        marginTop: 40,
        flexDirection: 'row',
        justifyContent: 'space-evenly'
    }
})
