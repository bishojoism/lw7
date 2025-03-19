import {Button} from "@/components/ui/button";
import {Download, Home} from "lucide-react";
import {useRouter} from "next/navigation";
import {ReactNode} from "react";
import manifest from "@/../public/manifest.json";
import {Switch} from "@/components/ui/switch";
import {Label} from "./ui/label";

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
                <div className="flex items-center space-x-2">
                    <Switch
                        checked={Notification.permission === 'granted'}
                        disabled={Notification.permission === 'granted'}
                        onClick={() => {
                            Notification.requestPermission().then(permission => {
                                console.log(`获取通知权限${permission === 'granted' ? '成功' : permission === 'denied' ? '失败' : '待定'}`)
                            })
                        }}
                    />
                    <Label htmlFor="notification">通知</Label>
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