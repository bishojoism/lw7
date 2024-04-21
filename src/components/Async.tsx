import {forwardRef, ReactNode, useState} from "react";
import {Button} from "@/components/ui/button";
import Report from "@/components/Report";

interface AsyncProps {
    fn: () => Promise<void>
    children?: ReactNode
}

export default forwardRef<HTMLButtonElement, AsyncProps>(function Async({fn, children}, ref) {
    const [error, setError] = useState<Error | null>()
    const handleClick = () => {
        setError(null)
        fn()
            .then(() => setError(undefined))
            .catch(reason => setError(reason instanceof Error ? reason : new Error(String(reason))))
    }
    if (error instanceof Error) return <Report error={error} onRetry={handleClick}/>
    return <Button variant="secondary" disabled={error === null} onClick={handleClick} ref={ref}>{children}</Button>
})