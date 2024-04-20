import prisma from "@/prisma/index";

export default ({lt}: { lt?: number }) => prisma.topic.findMany({
    ...lt !== undefined && {where: {id: {lt}}},
    orderBy: {
        id: 'desc'
    },
    take: 10,
    select: {
        id: true,
        createdAt: true,
        message: true
    }
})