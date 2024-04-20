import {useState} from "react";
import {Button} from "@/components/ui/button";
import {useToast} from "@/components/ui/use-toast";
import {ToastAction} from "@/components/ui/toast";

export default function Async({fn, children}: { fn: () => Promise<void>, children: string }) {
    const [loading, setLoading] = useState(false)
    const {toast} = useToast()
    const handleClick = () => {
        setLoading(true)
        fn()
            .catch(reason => toast({
                variant: 'destructive',
                title: reason instanceof Error ? reason.toString() : String(reason),
                description: reason instanceof Error && reason.stack,
                action: <ToastAction altText={`重试${children}`} onClick={handleClick}>重试</ToastAction>
            }))
            .finally(() => setLoading(false))
    }
    return <Button variant="secondary" disabled={loading} onClick={handleClick}>{children}</Button>
}