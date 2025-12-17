'use client'

import get from "@/prisma/comment/get";
import client from "@/client";
import from from "@/base64/from";
import {useCallback, useMemo, useState} from "react";
import useLocalStorage from "@/hooks/useLocalStorage";
import {Lock} from "lucide-react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import Await from "@/components/Await";
import {decrypt, encrypt, importKey} from "@/crypto/symmetric";
import {z} from "zod";
import Async from "@/components/Async";
import {cn} from "@/lib/utils";
import Anchor from "@/components/Anchor";
import {Textarea} from "@/components/ui/textarea";
import {importSignKey, sign} from "@/crypto/digital";
import to from "@/base64/to";
import {importUnwrapKey, unwrap} from "@/crypto/asymmetric";
import {Separator} from "@/components/ui/separator";
import idSchema from "@/client/idSchema";
import MDX from "@/components/MDX";
import Frame from "@/components/Frame";
import {Switch} from "@/components/ui/switch";
import {Label} from "@/components/ui/label";
import notification from "@/app/notification";

const poster = client(idSchema)
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
export default function Main({params: {commentId: commentId_}}: { params: { commentId: string } }) {
    const commentId = useMemo(() => Number(commentId_), [commentId_])
    const [data, setData] = useState<ReturnType<typeof parse>>()
    const refresh = useCallback(async () => {
        const result = parse(await getter(`/api/comment?id=${commentId}`))
        setData(result)
    }, [commentId])
    const loadNew = useCallback(async () => {
        if (data?.list.length) {
            const result = parse(await getter(`/api/comment?id=${commentId}&gt=${data.list[0].id}`))
            result.list.forEach(({id, at}) => {
                notification(`&${id}`, at)
            })
            setData(data => data === undefined ? result : {
                ...result,
                list: [...result.list.reverse(), ...data.list]
            })
        } else await refresh()
    }, [data, refresh, commentId])
    const loadOld = useCallback(async () => {
        if (data?.list.length) {
            const result = parse(await getter(`/api/comment?id=${commentId}&lt=${data.list[data.list.length - 1].id}`))
            setData(data => data === undefined ? result : {
                ...result,
                list: [...data.list, ...result.list]
            })
        } else await refresh()
    }, [data, refresh, commentId])
    return (
        <Frame title={'#' + commentId} header="评论" actions={<Async autoClick fn={refresh}>刷新</Async>}>
            {data !== undefined && (() => {
                const {parent, parentId, at, keyWrapped, messageData, messageVector, list} = data
                return (
                    <Await fn={async () => {
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
                    }}>
                        {res =>
                            <>
                                <Card className="my-4">
                                    <CardHeader>
                                        <CardTitle>
                                            <Anchor href={`/topic/${parentId}`}>{">"}{parentId}</Anchor>
                                        </CardTitle>
                                        <CardDescription>{parent.at}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <MDX>{parent.message}</MDX>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            <Anchor href={`/comment/${commentId}`}>{"#"}{commentId}</Anchor>
                                        </CardTitle>
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
                                <Separator/>
                                {res && <Has commentId={commentId} res={res}/>}
                                <Async autoPoll fn={loadNew}>加载更近</Async>
                                <ul className="space-y-2">
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
                                <Async fn={loadOld}>加载更远</Async>
                            </>}
                    </Await>
                )
            })()}
        </Frame>
    )
}

function Has({commentId, res}: {
    commentId: number
    res: {
        secret: CryptoKey
        commentator: boolean
        signKey: CryptoKey
    }
}) {
    const [msg, setMsg] = useLocalStorage(`msg-#${commentId}`)
    const [preview, setPreview] = useState(false)
    return (
        <>
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
                <Create
                    res={res}
                    commentId={commentId}
                    msg={msg}
                    setMsg={setMsg}
                    setPreview={setPreview}
                />
            </div>
            <Separator/>
        </>
    )
}

function Create({commentId, res, msg, setMsg, setPreview}: {
    commentId: number
    res: {
        secret: CryptoKey
        commentator: boolean
        signKey: CryptoKey
    }
    msg: string | undefined
    setMsg: (value: undefined) => void
    setPreview: (value: boolean) => void
}) {
    const create = useCallback(async () => {
        const [messageVector, messageData] = await encrypt(res.secret, Buffer.from(msg ?? ''))
        const body = JSON.stringify({
            commentId,
            commentator: res.commentator,
            messageData: to(Buffer.from(new Uint8Array(messageData))),
            messageVector: to(Buffer.from(new Uint8Array(messageVector))),
        })
        await poster('/api/comment', {
            method: 'POST',
            headers: {Authorization: to(Buffer.from(await sign(res.signKey, Buffer.from(body))))},
            body
        })
        setMsg(undefined)
        setPreview(false)
    }, [res, commentId, msg, setMsg, setPreview])
    return <Async fn={create}>创建回复</Async>
}

function Show({secret, messageData, messageVector}: { secret: CryptoKey, messageData: Buffer, messageVector: Buffer }) {
    return (
        <Await fn={useCallback(async () =>
                Buffer.from(await decrypt(secret, [messageVector.buffer.slice() as ArrayBuffer, messageData.buffer.slice() as ArrayBuffer ])).toString(),
            [secret, messageData, messageVector]
        )}>
            {res => <MDX>{res}</MDX>}
        </Await>
    )
}