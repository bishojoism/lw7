import {ReactNode, useState} from "react";
import {Button} from "@/components/ui/button";
import Report from "@/components/Report";

export default function Async({fn, children}: {
    fn: () => Promise<void>
    children?: ReactNode
}) {
    const [error, setError] = useState<Error | null>()
    const handleClick = () => {
        setError(null)
        fn()
            .then(() => setError(undefined))
            .catch(reason => setError(reason instanceof Error ? reason : new Error(String(reason))))
    }
    if (error instanceof Error) return <Report error={error} onRetry={handleClick}/>
    return <Button variant="secondary" disabled={error === null} onClick={handleClick}>{children}</Button>
}