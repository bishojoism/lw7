import prisma from "@/prisma";

export default ({id, lt}: { id: number, lt?: number }) => prisma.topic.findUniqueOrThrow({
    where: {id},
    select: {
        createdAt: true,
        message: true,
        keyWrap: true,
        _count: {
            select: {
                Comment: true
            }
        },
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
})