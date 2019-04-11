import { StyleSheet } from 'react-native'

export default deckStyles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    headingText: {
        fontSize: 20,
        textAlign: 'center',
        color: 'midnightblue',
        fontWeight: '900',
    },
    addCardContainer: {
        padding: 8,
        alignSelf: 'stretch',
        backgroundColor: 'lightblue',
        borderRadius: 2,
        borderWidth: StyleSheet.hairlineWidth,
    },
    addCardText: {
        color: 'blue',
        textAlign: 'center',
        fontWeight: '700',
    },
    startQuizContainer: {
        padding: 12,
        alignSelf: 'stretch',
        backgroundColor: 'purple',
        borderRadius: 2,
        marginTop: 10,
        marginBottom: 30,
        borderWidth: StyleSheet.hairlineWidth,
    },
    startQuiztext: {
        color: 'black',
        textAlign: 'center',
        fontWeight: '700',
    }
})
