import prisma from "@/prisma";

export default ({id, lt}: { id: number, lt?: number }) => prisma.comment.findUniqueOrThrow({
    where: {id},
    select: {
        createdAt: true,
        messageData: true,
        messageVector: true,
        keyWrapped: true,
        _count: {
            select: {
                Reply: true
            }
        },
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
})