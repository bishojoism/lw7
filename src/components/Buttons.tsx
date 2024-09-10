import {Button} from "@/components/ui/button";
import {Download, Home} from "lucide-react";
import {useRouter} from "next/navigation";

export default function Buttons({children}: {children: string}) {
    const {push} = useRouter()
    return (
        <div className="flex items-center justify-between">
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight">{children}</h1>
            <div className="space-x-2">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => push('/')}
                >
                    <Home className="w-4 h-4"/>
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => push('https://github.com/bishojoism/lw7/releases/latest')}
                >
                    <Download className="w-4 h-4"/>
                </Button>
            </div>
        </div>
    )
}