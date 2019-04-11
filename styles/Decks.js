import { StyleSheet } from 'react-native'

export default decksStyles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    headingText: {
        fontSize: 20,
        textAlign: 'center',
        color: 'midnightblue'
    },
    itemContainer: {
        padding: 8,
        alignSelf: 'stretch',
        backgroundColor: 'lightblue',
        borderRadius: 2,
        marginBottom: 1,
        borderWidth: StyleSheet.hairlineWidth,

    },
    text: {
        color: 'blue',
        textAlign: 'center',
        fontWeight: '700',
    }
})
