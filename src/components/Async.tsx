import {ReactNode, useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import Report from "@/components/Report";

export default function Async({fn, children, autoClick, lock}: {
    fn: () => Promise<void>
    children?: ReactNode
    autoClick?: boolean
    lock?: [boolean, (newLock: boolean) => void]
}) {
    const [error, setError] = useState<Error | null>()
    const handleClick = () => {
        lock?.[1](true)
        setError(null)
        fn()
            .then(() => {
                setError(undefined)
                lock?.[1](false)
            })
            .catch(reason => setError(reason instanceof Error ? reason : new Error(String(reason))))
    }
    useEffect(() => {
        if (autoClick) if (!lock?.[0]) handleClick()
    }, [])
    if (error instanceof Error) return <Report error={error} onRetry={handleClick}/>
    return <Button variant="secondary" disabled={lock?.[0] || error === null} onClick={handleClick}>{children}</Button>
}