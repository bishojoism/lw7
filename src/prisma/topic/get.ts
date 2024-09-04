import prisma from "@/prisma";
import to from "@/base64/to";

export default async ({id, lt, gt}: { id: number, lt?: number, gt?: number }) => {
    if (lt !== undefined && gt !== undefined) throw new Error('不能同时有lt和gt')
    const {createdAt, keyWrap, message, Comment} = await prisma.topic.findUniqueOrThrow({
        where: {id},
        select: {
            createdAt: true,
            keyWrap: true,
            message: true,
            Comment: {
                ...lt !== undefined ? {where: {id: {lt}}} : gt !== undefined && {where: {id: {gt}}},
                orderBy: {
                    id: gt !== undefined ? 'asc' : 'desc'
                },
                take: 10,
                select: {
                    id: true,
                    createdAt: true,
                    keyWrapped: true,
                    messageData: true,
                    messageVector: true
                }
            }
        }
    })
    return {
        create: createdAt.valueOf(),
        keyWrap: to(keyWrap),
        message,
        list: Comment.map(({id, createdAt, keyWrapped, messageData, messageVector}) => ({
            id,
            create: createdAt.valueOf(),
            keyWrapped: to(keyWrapped),
            messageData: to(messageData),
            messageVector: to(messageVector)
        }))
    }
}