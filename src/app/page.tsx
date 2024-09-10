'use client'

import {useCallback, useState} from "react";
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
import Anchor from "@/components/Anchor";
import {Separator} from "@/components/ui/separator";
import MDX from "@/components/MDX";
import Buttons from "@/components/Buttons";

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
export default function Page() {
    const [data, setData] = useState<ReturnType<typeof parse>>()
    const [msg, setMsg] = useLocalStorage('msg')
    const {push} = useRouter()
    const refresh = useCallback(async () => {
        const result = parse(await getter('/api'))
        setData(result)
    }, [])
    const create = useCallback(async () => {
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
    }, [msg, setMsg, push])
    const loadNew = useCallback(async () => {
        if (data?.length) {
            const list = parse(await getter(`/api?gt=${data[0].id}`))
            setData(data => data === undefined ? list : [...list, ...data])
        } else await refresh()
    }, [data, refresh])
    const loadOld = useCallback(async () => {
        if (data?.length) {
            const list = parse(await getter(`/api?lt=${data[data.length - 1].id}`))
            setData(data => data === undefined ? list : [...data, ...list])
        } else await refresh()
    }, [data, refresh])
    return (
        <div className="container py-8 space-y-6">
            <title>{name}</title>
            <Buttons>首页</Buttons>
            <Async autoClick fn={refresh}>刷新</Async>
            <Separator className="space-y-4"/>
            {data !== undefined && <>
                <Textarea
                    className="resize-none my-4"
                    placeholder="内容将公开可见"
                    value={msg ?? ''}
                    onChange={event => setMsg(event.target.value)}
                />
                <Async fn={create}>创建主题</Async>
                <Separator className="space-y-4"/>
                <Async autoPoll fn={loadNew}>加载更近</Async>
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
                                    <MDX>{message}</MDX>
                                </CardContent>
                            </Card>
                        </li>)}
                </ul>
                <Async fn={loadOld}>加载更远</Async>
            </>}
        </div>
    )
}