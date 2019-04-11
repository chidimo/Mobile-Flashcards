import { StyleSheet } from 'react-native'
import { purple } from '../utils/colors';

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
    }
})
