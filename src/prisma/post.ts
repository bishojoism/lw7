import prisma from "@/prisma/index";
import {importWrapKey} from "@/crypto/asymmetric";

const sensitive = fetch('https://raw.githubusercontent.com/cjh0613/tencent-sensitive-words/refs/heads/main/sensitive_words_lines.txt')
    .then(res => res.text())
    .then(value => new RegExp(value.split('\n').join('|')))

export default async (data: {
    keyVerify: Buffer
    keyWrap: Buffer
    message: string
}) => {
    await importWrapKey(data.keyWrap)
    const match = data.message.match(await sensitive)
    if (match) throw new Error(`触发敏感词“${match.join('”、“')}”`)
    return prisma.topic.create({data, select: {id: true}}).then(({id}) => id)
}