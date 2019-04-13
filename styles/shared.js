import { StyleSheet } from 'react-native'
import { purple, white, red } from '../utils/colors';

export default sharedStyles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    headingText: {
        fontSize: 20,
        textAlign: 'center',
        color: purple,
        fontWeight: '900',
    },
    text: {
        color: purple,
        textAlign: 'center',
        fontWeight: '700',
    },
    opacityContainer: {
        // alignSelf: 'stretch',
        // backgroundColor: lightGreen,
        padding: 12,
        borderRadius: 2,
        marginTop: 10,
        marginBottom: 30,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: white,
    },
    errorText: {
        color: red,
        textAlign: 'center',
        padding: 5,
    }
})
