// 'use client'
//
// import {useCallback, useEffect, useState} from "react";
// import {useRouter} from "next/navigation";
// import {
//     exportUnwrapKey,
//     exportWrapKey,
//     generateAsymmetricKey,
//     importUnwrapKey,
//     importWrapKey,
//     unwrap,
//     wrap
// } from "@/crypto/asymmetric";
// import idSchema from "@/client/idSchema";
// import client from "@/client";
// import {decrypt, encrypt, exportKey, generateSymmetricKey, importKey} from "@/crypto/symmetric";
// import get from "@/prisma/topic/get";
// import {z} from "zod";
// import from from "@/base64/from";
// import {useAsync, useAsyncFn, useLocalStorage} from "react-use";
// import {short_name} from "@/../public/manifest.json";
// import Report from "@/components/Report";
// import {Button} from "@/components/ui/button";
// import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
// import Link from "next/link";
// import {EyeOff} from "lucide-react";
// import Poster from "@/components/Poster";
// import {exportSignKey, exportVerifyKey, generateDigitalKey, sign} from "@/crypto/digital";
// import to from "@/base64/to";
// import {Textarea} from "@/components/ui/textarea";
//
// const poster = client(idSchema)
// const getter = client(z.object({
//     create: z.number(),
//     keyWrap: z.string(),
//     message: z.string(),
//     count: z.number(),
//     list: z.object({
//         id: z.number(),
//         create: z.number(),
//         keyWrapped: z.string(),
//         messageData: z.string(),
//         messageVector: z.string()
//     }).strict().array()
// }).strict())
// const parse = ({create, keyWrap, message, count, list}: Awaited<ReturnType<typeof get>>) => ({
//     at: new Date(create).toLocaleString(),
//     keyWrap: from(keyWrap),
//     message,
//     count,
//     list: list.map(({id, create, keyWrapped, messageData, messageVector}) => ({
//         id,
//         at: new Date(create).toLocaleString(),
//         keyWrapped: from(keyWrapped),
//         messageData: from(messageData),
//         messageVector: from(messageVector),
//     }))
// })
//
// export default function Main({topicId, initialData}: {
//     topicId: number
//     initialData: Awaited<ReturnType<typeof get>>
// }) {
//     const {push} = useRouter()
//     const [data, setData] = useState(parse(initialData))
//     const [{error, loading}, doFetch] = useAsyncFn(async () => {
//         const result = parse(await getter(`/api/topic?id=${topicId}&lt=${data.list[data.list.length - 1].id}`))
//         setData({...result, list: [...data.list, ...result.list]})
//     }, [data, setData])
//     const [{error: refreshes, loading: refreshing}, refresh] = useAsyncFn(async () => {
//         const result = parse(await getter(`/api/topic?id=${topicId}`))
//         setData(result)
//     }, [])
//     const state = useAsync(() => importWrapKey(data.keyWrap), [data])
//     const {value: decrypted, error: decrypts} = useAsync(async () => {
//         const unwrapKeyData = localStorage.getItem(`unwrapKey-${topicId}`)
//         const unwrapKey = unwrapKeyData === null ? null : await importUnwrapKey(from(unwrapKeyData))
//         const {at, keyWrap, message, count, list} = data
//         return {
//             at,
//             wrapKey: await importWrapKey(keyWrap),
//             message,
//             count,
//             list: await Promise.all(list.map(async ({id, at, keyWrapped, messageData, messageVector}) => {
//                 const keyData = localStorage.getItem(`topic-key-${id}`)
//                 const key = keyData === null ? null : await importKey(from(keyData))
//                 try {
//                     return {
//                         id,
//                         at,
//                         ...key ?
//                             {message: Buffer.from(await decrypt(key, [messageVector, messageData])).toString()} :
//                             unwrapKey && {message: Buffer.from(await decrypt(await unwrap(keyWrapped, unwrapKey), [messageVector, messageData])).toString()}
//                     }
//                 } catch (e) {
//                     console.log(messageVector, messageData)
//                     throw e
//                 }
//             }))
//         }
//     }, [topicId, data])
//     const [message, setMessage, delMessage] = useLocalStorage<string>(`topic-${topicId}-message`, undefined, {raw: true})
//     const [{error: submits, loading: submitting}, submit] = useAsyncFn(async () => {
//             if (!decrypted) throw decrypts ?? new Error('客户端数据解密尚未完成，请稍后重试')
//             const key = await generateSymmetricKey()
//             const [vector, data] = await encrypt(key, Buffer.from(message ?? ''))
//             const {signKey, verifyKey} = await generateDigitalKey()
//             const body = JSON.stringify({
//                 topicId,
//                 keyVerify: to(Buffer.from(await exportVerifyKey(verifyKey))),
//                 keyWrapped: to(Buffer.from(await wrap(key, decrypted.wrapKey))),
//                 messageData: to(Buffer.from(data)),
//                 messageVector: to(Buffer.from(vector)),
//             })
//             const id = idSchema.parse(await poster('/api/topic', {
//                 method: 'POST',
//                 headers: {Authorization: to(Buffer.from(await sign(signKey, Buffer.from(body))))},
//                 body
//             }))
//             localStorage.setItem(`topic-signKey-${id}`, to(Buffer.from(await exportSignKey(signKey))))
//             localStorage.setItem(`topic-key-${id}`, to(Buffer.from(await exportKey(key))))
//             push(`/comment/${id}`)
//     }, [decrypted, decrypts, topicId, message, push])
//     useEffect(() => {
//         if (!submits && !submitting) delMessage()
//     }, [submits, submitting])
//     return (
//         <div className="container py-8">
//             <title>{`>${topicId}|${short_name}`}</title>
//             <h1 className="scroll-m-20 text-5xl font-extrabold tracking-tight">主题</h1>
//             <div className="space-y-6 mt-12">
//                 <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">新建评论</h2>
//                 <Textarea
//                     className="resize-none"
//                     autoFocus
//                     placeholder="内容将受端到端加密保护"
//                     value={message}
//                     onChange={event => setMessage(event.target.value)}
//                 />
//                 <Report error={submits}/>
//                 <Button onClick={submit} variant="secondary" disabled={submitting}>提交</Button>
//             </div>
//             <div className="space-y-6 mt-12">
//                 <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">现有评论</h2>
//                 <Report error={refreshes}/>
//                 <Button variant="secondary" disabled={refreshing} onClick={refresh}>刷新</Button>
//                 <ul className="space-y-4">
//                     {decrypted &&
//                         <>
//                             {decrypted.list.map(({id, at, message}) =>
//                                 <li key={id}>
//                                     <Card>
//                                         <CardHeader>
//                                             <CardTitle>
//                                                 <Link
//                                                     className="text-[#1a0dab] visited:text-[#6c00a2] dark:text-[#8ab4f8] dark:visited:text-[#c58af9] hover:underline"
//                                                     href={`/topic/${id}`}
//                                                 >
//                                                     {">"}
//                                                     {id}
//                                                 </Link>
//                                             </CardTitle>
//                                             <CardDescription>{at}</CardDescription>
//                                         </CardHeader>
//                                         <CardContent>
//                                             {message === undefined ?
//                                                 <EyeOff/> :
//                                                 <p className="whitespace-pre-wrap break-all">{message}</p>
//                                             }
//                                         </CardContent>
//                                     </Card>
//                                 </li>)}
//                         </>}
//                 </ul>
//                 <Report error={error}/>
//                 <Button variant="secondary" disabled={loading} onClick={doFetch}>加载</Button>
//             </div>
//         </div>
//     )
// }

export default function Main(_: any) {
    return null
}