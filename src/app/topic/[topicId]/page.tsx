'use client'

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
import {Lock} from "lucide-react";
import Anchor from "@/components/Anchor";
import {Separator} from "@/components/ui/separator";
import MDX from "@/components/MDX";
import Frame from "@/components/Frame";
import {Switch} from "@/components/ui/switch";
import {Label} from "@/components/ui/label";
import notification from "@/app/notification";

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
    const [preview, setPreview] = useState(false)
    const refresh = useCallback(async () => {
        const result = parse(await getter(`/api/topic?id=${topicId}`))
        setData(result)
    }, [topicId])
    const loadNew = useCallback(async () => {
        if (data?.list.length) {
            const result = parse(await getter(`/api/topic?id=${topicId}&gt=${data.list[0].id}`))
            result.list.forEach(({id, at}) => {
                notification(`#${id}`, at)
            })
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
        <Frame title={'>' + topicId} header="主题" actions={<Async autoClick fn={refresh}>刷新</Async>}>
            {data !== undefined && (() => {
                const {keyWrap, at, message, list} = data
                return (
                    <>
                        <Card className="mt-4">
                            <CardHeader>
                                <CardTitle>
                                    <Anchor href={`/topic/${topicId}`}>{">"}{topicId}</Anchor>
                                </CardTitle>
                                <CardDescription>{at}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <MDX>{message}</MDX>
                            </CardContent>
                        </Card>
                        <Separator/>
                        {
                            preview ?
                                <MDX>{msg ?? ''}</MDX> :
                                <Textarea
                                    className="resize-none my-4"
                                    placeholder="内容将受端到端加密保护"
                                    value={msg ?? ''}
                                    onChange={event => setMsg(event.target.value)}
                                />
                        }
                        <div className="flex items-center space-x-2">
                            <Switch id="preview" checked={preview} onCheckedChange={setPreview}/>
                            <Label htmlFor="preview">预览</Label>
                            <Await fn={() => importWrapKey(keyWrap)}>
                                {res =>
                                    <Create
                                        res={res}
                                        topicId={topicId}
                                        msg={msg}
                                        setMsg={setMsg}
                                        setPreview={setPreview}
                                    />}
                            </Await>
                        </div>
                        <Separator/>
                        <Async autoPoll fn={loadNew}>加载更近</Async>
                        <Await fn={async () => {
                            const unwrapKeyData = localStorage.getItem(`unwrapKey-${topicId}`)
                            return unwrapKeyData === null ? undefined : importUnwrapKey(from(unwrapKeyData))
                        }}>
                            {res =>
                                <ul className="space-y-2">
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
        </Frame>
    )
}

function Create({res, topicId, msg, setMsg, setPreview}: {
    res: CryptoKey
    topicId: number
    msg: string | undefined
    setMsg: (value: undefined) => void
    setPreview: (value: false) => void
}) {
    const {push} = useRouter()
    const create = useCallback(async () => {
        const key = await generateSymmetricKey()
        const [vector, data] = await encrypt(key, Buffer.from(msg ?? ''))
        const {signKey, verifyKey} = await generateDigitalKey()
        const body = JSON.stringify({
            topicId,
            keyVerify: to(Buffer.from(await exportVerifyKey(verifyKey))),
            keyWrapped: to(Buffer.from(await wrap(key, res))),
            messageData: to(Buffer.from(new Uint8Array(data))),
            messageVector: to(Buffer.from(new Uint8Array(vector))),
        })
        const id = idSchema.parse(await poster('/api/topic', {
            method: 'POST',
            headers: {Authorization: to(Buffer.from(await sign(signKey, Buffer.from(body))))},
            body
        }))
        localStorage.setItem(`signKey->${id}`, to(Buffer.from(await exportSignKey(signKey))))
        localStorage.setItem(`key->${id}`, to(Buffer.from(await exportKey(key))))
        setMsg(undefined)
        setPreview(false)
        push(`/comment/${id}`)
    }, [res, topicId, msg, setMsg, setPreview, push])
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
            {res => res === undefined ? <Lock/> : <MDX>{res}</MDX>}
        </Await>
    )
}