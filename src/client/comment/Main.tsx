'use client'

import get from "@/prisma/comment/get";
import client from "@/client";
import from from "@/base64/from";
import {useCallback, useState} from "react";
import useLocalStorage from "@/hooks/useLocalStorage";
import {useRouter} from "next/navigation";
import {short_name} from "@/../public/manifest.json";
import {Button} from "@/components/ui/button";
import {Home, Lock} from "lucide-react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import Await from "@/components/Await";
import {decrypt, importKey} from "@/crypto/symmetric";
import {importUnwrapKey, unwrap} from "@/crypto/asymmetric";
import {z} from "zod";
import Link from "next/link";

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
    return (
        <div className="container py-8 space-y-6">
            <title>{`#${commentId}|${short_name}`}</title>
            <div className="flex items-center justify-between">
                <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight">评论</h1>
                <Button variant="outline" size="icon" onClick={() => push('/')}><Home className="w-4 h-4"/></Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>
                        <Link
                            className="text-[#1a0dab] visited:text-[#6c00a2] dark:text-[#8ab4f8] dark:visited:text-[#c58af9] hover:underline"
                            href={`/topic/${parentId}`}
                        >
                            {">"}
                            {parentId}
                        </Link>
                    </CardTitle>
                    <CardDescription>{parent.at}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="whitespace-pre-wrap break-all">{parent.message}</p>
                </CardContent>
            </Card>
            <Await fn={useCallback(async () => {
                const keyData = localStorage.getItem(`key->${commentId}`)
                if (keyData !== null) return importKey(from(keyData))
                const unwrapKeyData = localStorage.getItem(`unwrapKey-${parentId}`)
                if (unwrapKeyData !== null) return unwrap(keyWrapped, await importUnwrapKey(from(unwrapKeyData)))
            }, [commentId, parentId, keyWrapped])}>
                {res =>
                    <Content
                        secret={res}
                        commentId={commentId}
                        at={at}
                        messageData={messageData}
                        messageVector={messageVector}
                        list={list}
                    />}
            </Await>
        </div>
    )
}

function Content({secret, commentId, at, messageData, messageVector, list}: {
    secret?: CryptoKey
    commentId: number
    at: ReturnType<typeof parse>['at']
    messageData: ReturnType<typeof parse>['messageData']
    messageVector: ReturnType<typeof parse>['messageVector']
    list: ReturnType<typeof parse>['list']
}) {
    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>
                        {"#"}
                        {commentId}
                    </CardTitle>
                    <CardDescription>{at}</CardDescription>
                </CardHeader>
                <CardContent>
                    {secret === undefined ?
                        <Lock/> :
                        <Await fn={useCallback(async () =>
                                Buffer.from(await decrypt(secret, [messageVector, messageData])).toString(),
                            []
                        )}>
                            {res => <p className="whitespace-pre-wrap break-all">{res}</p>}
                        </Await>}
                </CardContent>
            </Card>
            <ul className="space-y-4">
                {list.map(({id, at, commentator, messageData, messageVector}) =>
                    <li key={id}>

                    </li>)}
            </ul>
        </>
    )
}