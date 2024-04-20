import server from "@/server";
import idSchema from "@/server/idSchema";
import ltSchema from "@/server/ltSchema";
import get from "@/prisma/topic/get";
import to from "@/base64/to";

export default server(async ({nextUrl: {searchParams}}) => {
    const id = idSchema.parse(searchParams.get('id'))
    const lt = ltSchema.parse(searchParams.get('lt') ?? undefined)
    const {createdAt, message, _count, Comment} = await get({id, lt})
    return {
        create: createdAt.valueOf(),
        message,
        count: _count.Comment,
        list: Comment.map(({id, createdAt, keyWrapped, messageData, messageVector}) => ({
            id,
            create: createdAt.valueOf(),
            keyWrapped: to(keyWrapped),
            messageData: to(messageData),
            messageVector: to(messageVector)
        }))
    }
})