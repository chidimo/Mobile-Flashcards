import { Notifications, Permissions } from 'expo';
import { AsyncStorage } from 'react-native';


const NOTIFICATION_KEY = 'Flashcards:notifications'

const createNotification = () => {
    // object for creating notification
    return {
        title: 'Take a quiz',
        body: "🖐 Don't forget to complete a quiz today",
        ios: {
            sound: true,
        },
        android: {
            sound: true,
            priority: 'high',
            sticky: false,
            vibrate: true,
            badge: true,
        }
    }
}

const notificationSchedulingOptions = () => {
    let tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(18)
    tomorrow.setMinutes(30)

    return {
        time: tomorrow,
        repeat: 'day',
    }
}

export const setLocalNotification = () => {
    console.log('set next notification')
    AsyncStorage.getItem(NOTIFICATION_KEY)
    .then(JSON.parse)
    .then(data => {
        if (data === null) {
            Permissions.askAsync(Permissions.NOTIFICATIONS)
            .then( ({ status }) => {
                if (status === 'granted') {
                    // if status is granted, cancel all previous notifications
                    // and create for the present day
                    Notifications.cancelAllScheduledNotificationsAsync()
                    Notifications.scheduleLocalNotificationAsync(
                        createNotification(), notificationSchedulingOptions()
                    )

                    AsyncStorage.setItem(NOTIFICATION_KEY, JSON.stringify(true))
                }
            })
        }
    })
}

export const clearLocalNotification = () => {
    return AsyncStorage.removeItem(NOTIFICATION_KEY)
    .then(Notifications.cancelAllScheduledNotificationsAsync())
}
