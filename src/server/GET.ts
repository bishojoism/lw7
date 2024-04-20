import server from "@/server";
import ltSchema from "@/server/ltSchema";
import get from "@/prisma/get";

export default server(async ({nextUrl: {searchParams}}) => get({
    lt: ltSchema.parse(searchParams.get('lt') ?? undefined)
}))