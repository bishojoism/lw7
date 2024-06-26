import prisma from "@/prisma";
import to from "@/base64/to";

export default ({id, lt}: { id: number, lt?: number }) => prisma.topic.findUniqueOrThrow({
    where: {id},
    select: {
        createdAt: true,
        keyWrap: true,
        message: true,
        Comment: {
            ...lt !== undefined && {where: {id: {lt}}},
            orderBy: {
                id: 'desc'
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
}).then(({createdAt, keyWrap, message, Comment}) => ({
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
}))