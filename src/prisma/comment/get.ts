import prisma from "@/prisma";
import to from "@/base64/to";

export default ({id, lt}: { id: number, lt?: number }) => prisma.comment.findUniqueOrThrow({
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
            ...lt !== undefined && {where: {id: {lt}}},
            orderBy: {
                id: 'desc'
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
}).then(({Topic, topicId, createdAt, keyWrapped, messageData, messageVector, Reply}) => ({
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
}))