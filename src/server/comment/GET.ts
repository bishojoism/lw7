import server from "@/server";
import idSchema from "@/server/idSchema";
import ltSchema from "@/server/ltSchema";
import get from "@/prisma/comment/get";

export default server(async ({nextUrl: {searchParams}}) => get({
    id: idSchema.parse(searchParams.get('id')),
    lt: ltSchema.parse(searchParams.get('lt') ?? undefined)
}))