import {Textarea} from "@/components/ui/textarea";
import {useAsyncFn, useLocalStorage} from "react-use";
import {useEffect} from "react";
import Report from "@/components/Report";
import {Button} from "@/components/ui/button";

export default function Poster({title, description, messageKey, callback}: {
    title: string
    description: string
    messageKey: string
    callback: (message: string) => Promise<void>
}) {
    const [message, setMessage, delMessage] = useLocalStorage<string>(messageKey, undefined, {raw: true})
    const [{error, loading}, doFetch] = useAsyncFn(() => callback(message ?? ''), [callback, message])
    useEffect(() => {
        if (!error && !loading) delMessage()
    }, [error, loading])
    return (
        <div className="space-y-6 mt-12">
            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">{title}</h2>
            <Textarea
                className="resize-none"
                autoFocus
                placeholder={description}
                value={message}
                onChange={event => setMessage(event.target.value)}
            />
            <Report error={error}/>
            <Button onClick={doFetch} variant="secondary" disabled={loading}>提交</Button>
        </div>
    )
}