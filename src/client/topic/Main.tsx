'use client'

import {short_name} from "@/../public/manifest.json";
import client from "@/client";
import get from "@/prisma/topic/get";
import {useRouter} from "next/navigation";
import {useCallback, useState} from "react";
import useLocalStorage from "@/hooks/useLocalStorage";
import idSchema from "@/client/idSchema";
import {z} from "zod";
import from from "@/base64/from";
import {Textarea} from "@/components/ui/textarea";
import Async from "@/components/Async";
import {importUnwrapKey, importWrapKey, unwrap, wrap} from "@/crypto/asymmetric";
import {exportSignKey, exportVerifyKey, generateDigitalKey, sign} from "@/crypto/digital";
import to from "@/base64/to";
import {decrypt, encrypt, exportKey, generateSymmetricKey, importKey} from "@/crypto/symmetric";
import Await from "@/components/Await";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import Link from "next/link";
import {Home, Lock} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible";

const poster = client(idSchema)
const getter = client(z.object({
    create: z.number(),
    keyWrap: z.string(),
    message: z.string(),
    list: z.object({
        id: z.number(),
        create: z.number(),
        keyWrapped: z.string(),
        messageData: z.string(),
        messageVector: z.string()
    }).strict().array()
}).strict())
const parse = ({create, keyWrap, message, list}: Awaited<ReturnType<typeof get>>) => ({
    at: new Date(create).toLocaleString(),
    keyWrap: from(keyWrap),
    message,
    list: list.map(({id, create, keyWrapped, messageData, messageVector}) => ({
        id,
        at: new Date(create).toLocaleString(),
        keyWrapped: from(keyWrapped),
        messageData: from(messageData),
        messageVector: from(messageVector),
    }))
})

export default function Main({topicId, initialData}: {
    topicId: number
    initialData: Awaited<ReturnType<typeof get>>
}) {
    const [data, setData] = useState(parse(initialData))
    const [msg, setMsg] = useLocalStorage(`msg->${topicId}`)
    const {keyWrap, at, message, list} = data
    const {push} = useRouter()
    return (
        <div className="container py-8 space-y-6">
            <title>{`>${topicId}|${short_name}`}</title>
            <div className="flex items-center justify-between">
                <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight">主题</h1>
                <Button variant="outline" size="icon" onClick={() => push('/')}><Home className="w-4 h-4"/></Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>
                        {">"}
                        {topicId}
                    </CardTitle>
                    <CardDescription>{at}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="whitespace-pre-wrap break-all">{message}</p>
                </CardContent>
            </Card>
            <Collapsible>
                <CollapsibleTrigger>创建评论</CollapsibleTrigger>
                <CollapsibleContent>
                    <Textarea
                        className="resize-none my-4"
                        autoFocus
                        placeholder="内容将受端到端加密保护"
                        value={msg}
                        onChange={event => setMsg(event.target.value)}
                    />
                    <Await fn={useCallback(() => importWrapKey(keyWrap), [keyWrap])}>
                        {value =>
                            <Post
                                wrapKey={value}
                                topicId={topicId}
                                message={msg ?? ''}
                                delMessage={() => setMsg(undefined)}
                            />}
                    </Await>
                </CollapsibleContent>
            </Collapsible>
            <Async fn={async () => {
                const result = parse(await getter(`/api/topic?id=${topicId}`))
                setData(result)
            }}>刷新</Async>
            <Await fn={async () => {
                const unwrapKeyData = localStorage.getItem(`unwrapKey-${topicId}`)
                return unwrapKeyData === null ? undefined : await importUnwrapKey(from(unwrapKeyData))
            }}>
                {value => <Get unwrapKey={value} list={list}/>}
            </Await>
            <Async fn={async () => {
                const result = parse(await getter(`/api/topic?id=${topicId}&lt=${data.list[data.list.length - 1].id}`))
                setData({...result, list: [...data.list, ...result.list]})
            }}>加载</Async>
        </div>
    )
}

function Post({wrapKey, topicId, message, delMessage}: {
    wrapKey: CryptoKey
    topicId: number
    message: string
    delMessage: () => void
}) {
    const {push} = useRouter()
    return <Async fn={async () => {
        const key = await generateSymmetricKey()
        const [vector, data] = await encrypt(key, Buffer.from(message))
        const {signKey, verifyKey} = await generateDigitalKey()
        const body = JSON.stringify({
            topicId,
            keyVerify: to(Buffer.from(await exportVerifyKey(verifyKey))),
            keyWrapped: to(Buffer.from(await wrap(key, wrapKey))),
            messageData: to(Buffer.from(data)),
            messageVector: to(Buffer.from(vector)),
        })
        const id = idSchema.parse(await poster('/api/topic', {
            method: 'POST',
            headers: {Authorization: to(Buffer.from(await sign(signKey, Buffer.from(body))))},
            body
        }))
        localStorage.setItem(`signKey->${id}`, to(Buffer.from(await exportSignKey(signKey))))
        localStorage.setItem(`key->${id}`, to(Buffer.from(await exportKey(key))))
        delMessage()
        push(`/comment/${id}`)
    }}>提交</Async>
}

function Get({unwrapKey, list}: {
    unwrapKey?: CryptoKey
    list: ReturnType<typeof parse>['list']
}) {
    return (
        <ul className="space-y-4">
            {list.map(({id, at, keyWrapped, messageData, messageVector}) =>
                <li key={id}>
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                <Link
                                    className="text-[#1a0dab] visited:text-[#6c00a2] dark:text-[#8ab4f8] dark:visited:text-[#c58af9] hover:underline"
                                    href={`/comment/${id}`}
                                >
                                    {"#"}
                                    {id}
                                </Link>
                            </CardTitle>
                            <CardDescription>{at}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Await fn={async () => {
                                const keyData = localStorage.getItem(`topic-key-${id}`)
                                return keyData === null ?
                                    unwrapKey && Buffer.from(await decrypt(await unwrap(keyWrapped, unwrapKey), [messageVector, messageData])).toString() :
                                    Buffer.from(await decrypt(await importKey(from(keyData)), [messageVector, messageData])).toString()
                            }}>
                                {value => <Item message={value}/>}
                            </Await>
                        </CardContent>
                    </Card>
                </li>)}
        </ul>
    )
}

export function Item({message}: {
    message?: string
}) {
    return message === undefined ? <Lock/> : <p className="whitespace-pre-wrap break-all">{message}</p>
}