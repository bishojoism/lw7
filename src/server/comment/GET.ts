import server from "@/server";
import idSchema from "@/server/idSchema";
import tSchema from "@/server/tSchema";
import get from "@/prisma/comment/get";

export default server(async ({nextUrl: {searchParams}}) => get({
    id: idSchema.parse(searchParams.get('id')),
    lt: tSchema.parse(searchParams.get('lt') ?? undefined),
    gt: tSchema.parse(searchParams.get('gt') ?? undefined)
}))