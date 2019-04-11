import { StyleSheet } from 'react-native'

import { white, purple, lightGrey } from '../utils/colors';

export default deckStyles = StyleSheet.create({
    addCardContainer: {
        padding: 8,
        alignSelf: 'stretch',
        backgroundColor: lightGrey,
        borderRadius: 2,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: white,
    },
    addCardText: {
        color: purple,
        textAlign: 'center',
        fontWeight: '700',
    },
    startQuizContainer: {
        padding: 12,
        alignSelf: 'stretch',
        backgroundColor: lightGrey,
        borderRadius: 2,
        marginTop: 10,
        marginBottom: 30,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: white,
    },
    startQuiztext: {
        color: purple,
        textAlign: 'center',
        fontWeight: '700',
    }
})
