import server from "@/server";
import ltSchema from "@/server/ltSchema";
import get from "@/prisma/get";

export default server(async ({nextUrl: {searchParams}}) => {
    const lt = ltSchema.parse(searchParams.get('lt') ?? undefined)
    const list = await get({lt})
    return list.map(({id, createdAt, message}) => ({
        id,
        create: createdAt.valueOf(),
        message
    }))
})