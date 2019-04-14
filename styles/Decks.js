import { StyleSheet } from 'react-native'
import { loveRomance, purple, white } from '../utils/colors';

export default decksStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    itemContainer: {
        padding: 8,
        alignSelf: 'stretch',
        borderBottomColor: white,
        borderTopColor: loveRomance,
        borderRightColor: white,
        borderLeftColor: white,
        marginBottom: 1,
        borderWidth: StyleSheet.hairlineWidth,
    },
    text: {
        color: purple,
        textAlign: 'center',
        fontWeight: '700',
    }
})
