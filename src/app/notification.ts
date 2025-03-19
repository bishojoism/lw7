export default function notification(title: string, body: string) {
    new Notification(title, {body})
}