'use client'

import get from "@/prisma/comment/get";
import client from "@/client";
import from from "@/base64/from";
import {useCallback, useRef, useState} from "react";
import useLocalStorage from "@/hooks/useLocalStorage";
import {useRouter} from "next/navigation";
import {short_name} from "@/../public/manifest.json";
import {Button} from "@/components/ui/button";
import {Home, Lock} from "lucide-react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import Await from "@/components/Await";
import {decrypt, encrypt, importKey} from "@/crypto/symmetric";
import {importUnwrapKey, unwrap} from "@/crypto/asymmetric";
import {z} from "zod";
import Async from "@/components/Async";
import {cn} from "@/lib/utils";
import Anchor from "@/components/Anchor";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible";
import {Textarea} from "@/components/ui/textarea";
import {importSignKey, sign} from "@/crypto/digital";
import to from "@/base64/to";

const poster = client(z.undefined())
const getter = client(z.object({
    parent: z.object({
        create: z.number(),
        message: z.string()
    }),
    parentId: z.number(),
    create: z.number(),
    keyWrapped: z.string(),
    messageData: z.string(),
    messageVector: z.string(),
    list: z.object({
        id: z.number(),
        create: z.number(),
        commentator: z.boolean(),
        messageData: z.string(),
        messageVector: z.string()
    }).strict().array()
}).strict())
const parse = ({
                   parent,
                   parentId,
                   create,
                   keyWrapped,
                   messageData,
                   messageVector,
                   list
               }: Awaited<ReturnType<typeof get>>) => ({
    parent: {
        at: new Date(parent.create).toLocaleString(),
        message: parent.message
    },
    parentId,
    at: new Date(create).toLocaleString(),
    keyWrapped: from(keyWrapped),
    messageData: from(messageData),
    messageVector: from(messageVector),
    list: list.map(({id, create, commentator, messageData, messageVector}) => ({
        id,
        at: new Date(create).toLocaleString(),
        commentator,
        messageData: from(messageData),
        messageVector: from(messageVector)
    }))
})
export default function Main({commentId, initialData}: {
    commentId: number
    initialData: Awaited<ReturnType<typeof get>>
}) {
    const [{parent, parentId, at, keyWrapped, messageData, messageVector, list}, setData] = useState(parse(initialData))
    const [msg, setMsg] = useLocalStorage(`msg-#${commentId}`)
    const {push} = useRouter()
    const ref = useRef<HTMLButtonElement>(null)
    return (
        <div className="container py-8 space-y-6">
            <title>{`#${commentId}|${short_name}`}</title>
            <div className="flex items-center justify-between">
                <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight">评论</h1>
                <Button variant="outline" size="icon" onClick={() => push('/')}><Home className="w-4 h-4"/></Button>
            </div>
            <Await fn={useCallback(async () => {
                const keyData = localStorage.getItem(`key->${commentId}`)
                if (keyData !== null) return {
                    secret: await importKey(from(keyData)),
                    commentator: true,
                    signKey: await importSignKey(from(localStorage.getItem(`signKey->${commentId}`) ?? ''))
                }
                const unwrapKeyData = localStorage.getItem(`unwrapKey-${parentId}`)
                if (unwrapKeyData !== null) return {
                    secret: await unwrap(keyWrapped, await importUnwrapKey(from(unwrapKeyData))),
                    commentator: false,
                    signKey: await importSignKey(from(localStorage.getItem(`signKey-${parentId}`) ?? ''))
                }
            }, [commentId, parentId, keyWrapped])}>
                {res =>
                    <>
                        <Collapsible>
                            <CollapsibleTrigger>显示内容</CollapsibleTrigger>
                            <CollapsibleContent>
                                <Card className="my-4">
                                    <CardHeader>
                                        <CardTitle>
                                            <Anchor href={`/topic/${parentId}`}>{">"}{parentId}</Anchor>
                                        </CardTitle>
                                        <CardDescription>{parent.at}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="whitespace-pre-wrap break-all">{parent.message}</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{"#"}{commentId}</CardTitle>
                                        <CardDescription>{at}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {res === undefined ?
                                            <Lock/> :
                                            <Show
                                                secret={res.secret}
                                                messageData={messageData}
                                                messageVector={messageVector}
                                            />}
                                    </CardContent>
                                </Card>
                            </CollapsibleContent>
                        </Collapsible>
                        {res &&
                            <div className="flex items-end space-x-2">
                                <Textarea
                                    className="min-h-10 h-10"
                                    autoFocus
                                    placeholder="内容将受端到端加密保护"
                                    value={msg ?? ''}
                                    onChange={event => setMsg(event.target.value)}
                                />
                                <Async fn={async () => {
                                    const [vector, data] = await encrypt(res.secret, Buffer.from(msg ?? ''))
                                    const body = JSON.stringify({
                                        commentId,
                                        commentator: res.commentator,
                                        messageData: to(Buffer.from(data)),
                                        messageVector: to(Buffer.from(vector)),
                                    })
                                    await poster('/api/comment', {
                                        method: 'POST',
                                        headers: {Authorization: to(Buffer.from(await sign(res.signKey, Buffer.from(body))))},
                                        body
                                    })
                                    setMsg(undefined)
                                    ref.current?.click()
                                }}>发送</Async>
                            </div>}
                        <Async fn={async () => {
                            const result = parse(await getter(`/api/comment?id=${commentId}`))
                            setData(result)
                        }} ref={ref}>刷新</Async>
                        <ul className="space-y-4">
                            {list.map(({id, at, commentator, messageData, messageVector}) =>
                                <li key={id}>
                                    <div className={cn("flex", commentator ?
                                        "justify-end" :
                                        "justify-start")}>
                                        <div className={cn("rounded-2xl px-4 py-3", commentator ?
                                            "rounded-tr ml-2 bg-pink-50 dark:bg-pink-950" :
                                            "rounded-tl mr-2 bg-white dark:bg-black")}>
                                            {res === undefined ?
                                                <Lock/> :
                                                <Show
                                                    secret={res.secret}
                                                    messageData={messageData}
                                                    messageVector={messageVector}/>}
                                            <div className="flex justify-between text-muted-foreground text-xs">
                                                <span className="mr-2">{"&"}{id}</span>
                                                <span>{at}</span>
                                            </div>
                                        </div>
                                    </div>
                                </li>)}
                        </ul>
                        <Async fn={async () => {
                            const result = parse(await getter(`/api/comment?id=${commentId}&lt=${list[list.length - 1].id}`))
                            setData({...result, list: [...list, ...result.list]})
                        }}>加载</Async>
                    </>}
            </Await>
        </div>
    )
}

function Show({secret, messageData, messageVector}: { secret: CryptoKey, messageData: Buffer, messageVector: Buffer }) {
    return (
        <Await fn={useCallback(async () =>
                Buffer.from(await decrypt(secret, [messageVector, messageData])).toString(),
            [secret, messageData, messageVector]
        )}>
            {res => <p className="whitespace-pre-wrap break-all">{res}</p>}
        </Await>
    )
}