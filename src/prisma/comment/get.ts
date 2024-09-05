import prisma from "@/prisma";
import to from "@/base64/to";

export default async ({id, lt, gt}: { id: number, lt?: number, gt?: number }) => {
    if (lt !== undefined && gt !== undefined) throw new Error('不能同时有lt和gt')
    const {
        Topic,
        topicId,
        createdAt,
        keyWrapped,
        messageData,
        messageVector,
        Reply
    } = await prisma.comment.findUniqueOrThrow({
        where: {id},
        select: {
            Topic: {
                select: {
                    createdAt: true,
                    message: true
                }
            },
            topicId: true,
            createdAt: true,
            keyWrapped: true,
            messageData: true,
            messageVector: true,
            Reply: {
                ...lt !== undefined ? {where: {id: {lt}}} : gt !== undefined && {where: {id: {gt}}},
                orderBy: {
                    id: gt !== undefined ? 'asc' : 'desc'
                },
                take: 10,
                select: {
                    id: true,
                    createdAt: true,
                    commentator: true,
                    messageData: true,
                    messageVector: true
                }
            }
        }
    })
    if (gt !== undefined) Reply.reverse()
    return {
        parent: {
            create: Topic.createdAt.valueOf(),
            message: Topic.message
        },
        parentId: topicId,
        create: createdAt.valueOf(),
        keyWrapped: to(keyWrapped),
        messageData: to(messageData),
        messageVector: to(messageVector),
        list: Reply.map(({id, createdAt, commentator, messageData, messageVector}) => ({
            id,
            create: createdAt.valueOf(),
            commentator,
            messageData: to(messageData),
            messageVector: to(messageVector)
        }))
    }
}