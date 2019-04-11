import { StyleSheet } from 'react-native'

import { purple, lightGrey, white } from '../utils/colors';

export default sharedButtonStyles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: lightGrey,
        paddingVertical: 15,
        marginBottom: 12,
        paddingVertical: 12,
        borderRadius: 4,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: white,
    },

    text: {
        color: purple,
        textAlign: 'center',
        fontWeight: '700'
    }
})
