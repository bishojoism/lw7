import server from "@/server";
import {z} from "zod";
import auth from "@/server/auth";
import from from "@/base64/from";
import auSchema from "@/server/auSchema";
import post from "@/prisma/comment/post";
import sire from "@/prisma/comment/sire";

const schema = z.object({
    commentId: z.number(),
    commentator: z.boolean(),
    messageData: z.string().transform(from),
    messageVector: z.string().transform(from),
}).strict()

export default server(async request => {
    const arrayBuffer = await request.arrayBuffer()
    const data = schema.parse(JSON.parse(Buffer.from(arrayBuffer).toString()))
    await auth(await sire(data.commentator, data.commentId), arrayBuffer, auSchema.parse(request.headers.get('Authorization')))
    return post(data)
})