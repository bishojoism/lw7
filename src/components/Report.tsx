import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {Button} from "@/components/ui/button";
import {RefreshCw} from "lucide-react";
import {useEffect} from "react";

export default function Report({error, onRetry}: { error: Error, onRetry: () => void }) {
    useEffect(() => {
        console.error(error)
    }, [error])
    return (
        <Alert variant="destructive">
            <Button variant="outline" size="icon" onClick={onRetry} asChild>
                <RefreshCw className="w-4 h-4"/>
            </Button>
            <AlertTitle>
                <pre className="overflow-auto">{error.toString()}</pre>
            </AlertTitle>
            <AlertDescription>
                <pre className="overflow-auto">{error.stack}</pre>
            </AlertDescription>
        </Alert>
    )
}