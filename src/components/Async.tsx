import {ReactNode, useCallback, useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import Report from "@/components/Report";

export default function Async({fn, children, autoClick, autoPoll}: {
    fn: () => Promise<void>
    children?: ReactNode
    autoClick?: boolean
    autoPoll?: boolean
}) {
    const [error, setError] = useState<Error | null>()
    const handleClick = useCallback(() => {
        setError(null)
        fn()
            .then(() => setError(undefined))
            .catch(reason => setError(reason instanceof Error ? reason : new Error(String(reason))))
    }, [fn])
    useEffect(() => {
        if (autoClick) handleClick()
        if (autoPoll) {
            const interval = setInterval(handleClick, 5000)
            return () => clearInterval(interval)
        }
    }, [autoClick, autoPoll, handleClick])
    if (error instanceof Error) return <Report error={error} onRetry={handleClick}/>
    return <Button variant="secondary" disabled={error === null} onClick={handleClick}>{children}</Button>
}