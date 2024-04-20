'use client'

import Poster from "@/components/Poster";
import {useCallback} from "react";
import {useRouter} from "next/navigation";
import {exportSignKey, exportVerifyKey, generateDigitalKey, sign} from "@/crypto/digital";
import {exportUnwrapKey, exportWrapKey, generateAsymmetricKey} from "@/crypto/asymmetric";
import idSchema from "@/client/idSchema";
import client from "@/client";
import to from "@/base64/to";

const fetcher = client(idSchema)

export default function Post() {
    const {push} = useRouter()
    return (
        <Poster
            title="新建主题"
            description="内容将公开可见"
            messageKey="message"
            callback={useCallback(async message => {
                const {wrapKey, unwrapKey} = await generateAsymmetricKey()
                const {signKey, verifyKey} = await generateDigitalKey()
                const body = JSON.stringify({
                    keyVerify: to(Buffer.from(await exportVerifyKey(verifyKey))),
                    keyWrap: to(Buffer.from(await exportWrapKey(wrapKey))),
                    message,
                })
                const id = idSchema.parse(await fetcher('/api', {
                    method: 'POST',
                    headers: {Authorization: to(Buffer.from(await sign(signKey, Buffer.from(body))))},
                    body
                }))
                localStorage.setItem(`signKey-${id}`, Buffer.from(await exportSignKey(signKey)).toString('base64'))
                localStorage.setItem(`unwrapKey-${id}`, Buffer.from(await exportUnwrapKey(unwrapKey)).toString('base64'))
                push(`/topic/${id}`)
            }, [push])}
        />
    )
}