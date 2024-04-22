import prisma from "@/prisma";
import to from "@/base64/to";

export default (data: {
    commentId: number
    commentator: boolean
    messageData: Buffer
    messageVector: Buffer
}) => prisma.reply.create({
        data,
        select: {
            Comment: {
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
            }
        }
    }
).then(({Comment: {Topic, topicId, createdAt, keyWrapped, messageData, messageVector, Reply}}) => ({
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