import server from "@/server";
import idSchema from "@/server/idSchema";
import ltSchema from "@/server/ltSchema";
import get from "@/prisma/comment/get";
import to from "@/base64/to";

export default server(async ({nextUrl: {searchParams}}) => {
    const id = idSchema.parse(searchParams.get('id'))
    const lt = ltSchema.parse(searchParams.get('lt') ?? undefined)
    const {Topic, createdAt, messageData, messageVector, _count, Reply} = await get({id, lt})
    return {
        parent: {
            id: Topic.id,
            create: Topic.createdAt.valueOf(),
            message: Topic.message
        },
        create: createdAt.valueOf(),
        messageData: to(messageData),
        messageVector: to(messageVector),
        count: _count.Reply,
        list: Reply.map(({id, createdAt, commentator, messageData, messageVector}) => ({
            id,
            create: createdAt.valueOf(),
            commentator,
            messageData: to(messageData),
            messageVector: to(messageVector)
        }))
    }
})