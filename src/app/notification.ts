export default function notification(title: string, body: string) {
    navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
            body
        }).then(() => {
            console.log('通知', title, body)
        })
    })
}