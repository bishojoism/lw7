import server from "@/server";
import tSchema from "@/server/tSchema";
import get from "@/prisma/get";

export default server(async ({nextUrl: {searchParams}}) => get({
    lt: tSchema.parse(searchParams.get('lt') ?? undefined),
    gt: tSchema.parse(searchParams.get('gt') ?? undefined)
}))