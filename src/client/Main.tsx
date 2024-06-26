'use client'

import {useState} from "react";
import {useRouter} from "next/navigation";
import {exportSignKey, exportVerifyKey, generateDigitalKey, sign} from "@/crypto/digital";
import {exportUnwrapKey, exportWrapKey, generateAsymmetricKey} from "@/crypto/asymmetric";
import idSchema from "@/client/idSchema";
import client from "@/client";
import to from "@/base64/to";
import get from "@/prisma/get";
import {name} from "@/../public/manifest.json";
import {z} from "zod";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Textarea} from "@/components/ui/textarea";
import useLocalStorage from "@/hooks/useLocalStorage";
import Async from "@/components/Async";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible";
import Anchor from "@/components/Anchor";
import {Button} from "@/components/ui/button";
import {Download} from "lucide-react";

const poster = client(idSchema)
const getter = client(z.object({
    id: z.number(),
    create: z.number(),
    message: z.string()
}).strict().array())
const parse = (data: Awaited<ReturnType<typeof get>>) => data.map(({id, create, message}) => ({
    id,
    at: new Date(create).toLocaleString(),
    message
}))
export default function Main({initialData}: {
    initialData: Awaited<ReturnType<typeof get>>
}) {
    const [data, setData] = useState(parse(initialData))
    const [msg, setMsg] = useLocalStorage('msg')
    const {push} = useRouter()
    return (
        <div className="container py-8 space-y-6">
            <title>{`首页|${name}`}</title>
            <div className="flex items-center justify-between">
                <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight">首页</h1>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => push('https://github.com/bishojoism/lw7/releases/latest')}
                >
                    <Download className="w-4 h-4"/>
                </Button>
            </div>
            <Collapsible>
                <CollapsibleTrigger>创建主题</CollapsibleTrigger>
                <CollapsibleContent>
                    <Textarea
                        className="resize-none my-4"
                        autoFocus
                        placeholder="内容将公开可见"
                        value={msg ?? ''}
                        onChange={event => setMsg(event.target.value)}
                    />
                    <Async fn={async () => {
                        const {wrapKey, unwrapKey} = await generateAsymmetricKey()
                        const {signKey, verifyKey} = await generateDigitalKey()
                        const body = JSON.stringify({
                            keyVerify: to(Buffer.from(await exportVerifyKey(verifyKey))),
                            keyWrap: to(Buffer.from(await exportWrapKey(wrapKey))),
                            message: msg ?? ''
                        })
                        const id = idSchema.parse(await poster('/api', {
                            method: 'POST',
                            headers: {Authorization: to(Buffer.from(await sign(signKey, Buffer.from(body))))},
                            body
                        }))
                        localStorage.setItem(`signKey-${id}`, to(Buffer.from(await exportSignKey(signKey))))
                        localStorage.setItem(`unwrapKey-${id}`, to(Buffer.from(await exportUnwrapKey(unwrapKey))))
                        setMsg(undefined)
                        push(`/topic/${id}`)
                    }}>提交</Async>
                </CollapsibleContent>
            </Collapsible>
            <Async fn={async () => {
                const result = parse(await getter('/api'))
                setData(result)
            }}>刷新</Async>
            <ul className="space-y-4">
                {data.map(({id, at, message}) =>
                    <li key={id}>
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    <Anchor href={`/topic/${id}`}>{">"}{id}</Anchor>
                                </CardTitle>
                                <CardDescription>{at}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-wrap break-all">{message}</p>
                            </CardContent>
                        </Card>
                    </li>)}
            </ul>
            <Async fn={async () => {
                const result = parse(await getter(`/api?lt=${data[data.length - 1].id}`))
                setData([...data, ...result])
            }}>加载</Async>
        </div>
    )
}