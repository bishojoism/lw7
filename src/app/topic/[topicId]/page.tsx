'use client'

import {name} from "../../../../public/manifest.json";
import client from "@/client";
import get from "@/prisma/topic/get";
import {useRouter} from "next/navigation";
import {useCallback, useMemo, useState} from "react";
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
import {Download, Home, Lock} from "lucide-react";
import {Button} from "@/components/ui/button";
import Anchor from "@/components/Anchor";
import {Separator} from "@/components/ui/separator";

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
        messageVector: from(messageVector)
    }))
})
export default function Page({params: {topicId: topicId_}}: { params: { topicId: string } }) {
    const topicId = useMemo(() => Number(topicId_), [topicId_])
    const [data, setData] = useState<ReturnType<typeof parse>>()
    const [msg, setMsg] = useLocalStorage(`msg->${topicId}`)
    const {push} = useRouter()
    const refresh = useCallback(async () => {
        const result = parse(await getter(`/api/topic?id=${topicId}`))
        setData(result)
    }, [topicId])
    const loadNew = useCallback(async () => {
        if (data?.list.length) {
            const result = parse(await getter(`/api/topic?id=${topicId}&gt=${data.list[0].id}`))
            setData(data => data === undefined ? result : {
                ...result,
                list: [...result.list, ...data.list]
            })
        } else await refresh()
    }, [data, refresh, topicId])
    const loadOld = useCallback(async () => {
        if (data?.list.length) {
            const result = parse(await getter(`/api/topic?id=${topicId}&lt=${data.list[data.list.length - 1].id}`))
            setData(data => data === undefined ? result : {
                ...result,
                list: [...data.list, ...result.list]
            })
        } else await refresh()
    }, [data, refresh, topicId])
    return (
        <div className="container py-8 space-y-6">
            <title>{`>${topicId}|${name}`}</title>
            <div className="flex items-center justify-between">
                <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight">主题</h1>
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
            <Async autoClick fn={refresh}>刷新</Async>
            <Separator className="space-y-4"/>
            {data !== undefined && (() => {
                const {keyWrap, at, message, list} = data
                return (
                    <>
                        <Card className="mt-4">
                            <CardHeader>
                                <CardTitle>{">"}{topicId}</CardTitle>
                                <CardDescription>{at}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-wrap break-all">{message}</p>
                            </CardContent>
                        </Card>
                        <Separator className="space-y-4"/>
                        <Textarea
                            className="resize-none my-4"
                            placeholder="内容将受端到端加密保护"
                            value={msg ?? ''}
                            onChange={event => setMsg(event.target.value)}
                        />
                        <Await fn={() => importWrapKey(keyWrap)}>
                            {res =>
                                <Create
                                    res={res}
                                    topicId={topicId}
                                    msg={msg}
                                    setMsg={setMsg}
                                    push={push}
                                />}
                        </Await>
                        <Separator className="space-y-4"/>
                        <Async autoPoll fn={loadNew}>加载更近</Async>
                        <Await fn={async () => {
                            const unwrapKeyData = localStorage.getItem(`unwrapKey-${topicId}`)
                            return unwrapKeyData === null ? undefined : importUnwrapKey(from(unwrapKeyData))
                        }}>
                            {res =>
                                <ul className="space-y-4">
                                    {list.map(({id, at, keyWrapped, messageData, messageVector}) =>
                                        <li key={id}>
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle>
                                                        <Anchor href={`/comment/${id}`}>{"#"}{id}</Anchor>
                                                    </CardTitle>
                                                    <CardDescription>{at}</CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <Show
                                                        id={id}
                                                        unwrapKey={res}
                                                        keyWrapped={keyWrapped}
                                                        messageData={messageData}
                                                        messageVector={messageVector}
                                                    />
                                                </CardContent>
                                            </Card>
                                        </li>)}
                                </ul>}
                        </Await>
                        <Async fn={loadOld}>加载更远</Async>
                    </>
                )
            })()}
        </div>
    )
}

function Create({res, topicId, msg, setMsg, push}: {
    res: CryptoKey
    topicId: number
    msg: string | undefined
    setMsg: (value: string | undefined) => void
    push: (value: string) => void
}) {
    const create = useCallback(async () => {
        const key = await generateSymmetricKey()
        const [vector, data] = await encrypt(key, Buffer.from(msg ?? ''))
        const {signKey, verifyKey} = await generateDigitalKey()
        const body = JSON.stringify({
            topicId,
            keyVerify: to(Buffer.from(await exportVerifyKey(verifyKey))),
            keyWrapped: to(Buffer.from(await wrap(key, res))),
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
        setMsg(undefined)
        push(`/comment/${id}`)
    }, [res, topicId, msg, setMsg, push])
    return <Async fn={create}>创建评论</Async>
}

function Show({id, unwrapKey, keyWrapped, messageData, messageVector}: {
    id: number
    unwrapKey?: CryptoKey
    keyWrapped: Buffer
    messageData: Buffer
    messageVector: Buffer
}) {
    return (
        <Await fn={async () => {
            const keyData = localStorage.getItem(`key->${id}`)
            return keyData === null ?
                unwrapKey && Buffer.from(await decrypt(await unwrap(keyWrapped, unwrapKey), [messageVector, messageData])).toString() :
                Buffer.from(await decrypt(await importKey(from(keyData)), [messageVector, messageData])).toString()
        }}>
            {res => res === undefined ? <Lock/> : <p className="whitespace-pre-wrap break-all">{res}</p>}
        </Await>
    )
}