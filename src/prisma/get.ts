import prisma from "@/prisma/index";

export default async ({lt, gt}: { lt?: number, gt?: number }) => {
    if (lt !== undefined && gt !== undefined) throw new Error('不能同时有lt和gt')
    const list = (await prisma.topic.findMany({
        ...lt !== undefined ? {where: {id: {lt}}} : gt !== undefined && {where: {id: {gt}}},
        orderBy: {
            id: gt !== undefined ? 'asc' : 'desc'
        },
        take: 10,
        select: {
            id: true,
            createdAt: true,
            message: true
        }
    }))
    if (gt !== undefined) list.reverse()
    return list.map(({id, createdAt, message}) => ({
        id,
        create: createdAt.valueOf(),
        message
    }))
}