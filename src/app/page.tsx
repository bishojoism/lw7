'use client'

import {useCallback, useState} from "react";
import {useRouter} from "next/navigation";
import {exportSignKey, exportVerifyKey, generateDigitalKey, sign} from "@/crypto/digital";
import {exportUnwrapKey, exportWrapKey, generateAsymmetricKey} from "@/crypto/asymmetric";
import idSchema from "@/client/idSchema";
import client from "@/client";
import to from "@/base64/to";
import get from "@/prisma/get";
import {z} from "zod";
import useLocalStorage from "@/hooks/useLocalStorage";
import Async from "@/components/Async";
import {Separator} from "@/components/ui/separator";
import Frame from "@/components/Frame";
import {Textarea} from "@/components/ui/textarea";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import Anchor from "@/components/Anchor";
import MDX from "@/components/MDX";
import {Switch} from "@/components/ui/switch";
import {Label} from "@/components/ui/label";

const poster = client(idSchema)
const getter = client(z.object({
    announcement: z.string(),
    list: z.object({
        id: z.number(),
        create: z.number(),
        message: z.string()
    }).strict().array()
}).strict())
const parse = ({announcement, list}: Awaited<ReturnType<typeof get>>) => ({
    announcement,
    list: list.map(({id, create, message}) => ({
        id,
        at: new Date(create).toLocaleString(),
        message
    }))
})
export default function Page() {
    const [data, setData] = useState<ReturnType<typeof parse>>()
    const [msg, setMsg] = useLocalStorage('msg')
    const [preview, setPreview] = useState(false)
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
        setPreview(false)
        push(`/topic/${id}`)
    }, [msg, setMsg, setPreview, push])
    const loadNew = useCallback(async () => {
        if (data?.list.length) {
            const result = parse(await getter(`/api?gt=${data.list[0].id}`))
            result.list.forEach(({id, at}) => {
                new Notification(`>${id}`, {body: at})
            })
            setData(data => data === undefined ? result : {
                ...result,
                list: [...result.list, ...data.list]
            })
        } else await refresh()
    }, [data, refresh])
    const loadOld = useCallback(async () => {
        if (data?.list.length) {
            const result = parse(await getter(`/api?lt=${data.list[data.list.length - 1].id}`))
            setData(data => data === undefined ? result : {
                ...result,
                list: [...data.list, ...result.list]
            })
        } else await refresh()
    }, [data, refresh])
    return (
        <Frame header="首页" actions={<Async autoClick fn={refresh}>刷新</Async>}>
            {data !== undefined && (() => {
                const {announcement, list} = data
                return (
                    <>
                        <Card className="mt-4">
                            <CardHeader>
                                <CardTitle>公告</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <MDX>{announcement}</MDX>
                            </CardContent>
                        </Card>
                        <Separator/>
                        {
                            preview ?
                                <MDX>{msg ?? ''}</MDX> :
                                <Textarea
                                    className="resize-none my-4"
                                    placeholder="内容将公开可见"
                                    value={msg ?? ''}
                                    onChange={event => setMsg(event.target.value)}
                                />
                        }
                        <div className="flex items-center space-x-2">
                            <Switch id="preview" checked={preview} onCheckedChange={setPreview}/>
                            <Label htmlFor="preview">预览</Label>
                            <Async fn={create}>创建主题</Async>
                        </div>
                        <Separator/>
                        <Async autoPoll fn={loadNew}>加载更近</Async>
                        <ul className="space-y-2">
                            {list.map(({id, at, message}) =>
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
                    </>
                )
            })()}
        </Frame>
    )
}