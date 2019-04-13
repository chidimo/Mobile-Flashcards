import { StyleSheet } from 'react-native';
import { lightGreen, white, green } from '../utils/colors'

export default quizViewStyles = StyleSheet.create({
    showAnswer: {
        padding: 12,
        alignSelf: 'stretch',
        backgroundColor: lightGreen,
        borderRadius: 2,
        marginTop: 10,
        marginBottom: 30,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: white,
    },
    questionContainer: {
        padding: 8,
        fontSize: 22,
        color: green,
        textAlign: 'center',
        borderWidth: StyleSheet.hairlineWidth,
    },
    answerContainer: {
        padding: 8,
        fontSize: 22,
        marginTop: 5,
        color: green,
        textAlign: 'center',
        borderWidth: StyleSheet.hairlineWidth,
    },
    markContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
    },
    showAnswerText: {
        textAlign: 'center',
    }
})
