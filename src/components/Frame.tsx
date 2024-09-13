import {Button} from "@/components/ui/button";
import {Download, Home} from "lucide-react";
import {useRouter} from "next/navigation";
import {ReactNode} from "react";
import manifest from "@/../public/manifest.json";

export default function Frame({title, header, actions, children}: {
    title?: string
    header: string
    actions: ReactNode
    children: ReactNode
}) {
    const {push} = useRouter()
    return (
        <div className="container py-6 space-y-4">
            <title>{title ? title + '|' + manifest.name : manifest.name}</title>
            <div className="flex items-center justify-between">
                <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight">{header}</h1>
                {actions}
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
            {children}
        </div>
    )
}