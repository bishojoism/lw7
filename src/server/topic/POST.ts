import server from "@/server";
import {z} from "zod";
import auth from "@/server/auth";
import from from "@/base64/from";
import auSchema from "@/server/auSchema";
import post from "@/prisma/topic/post";

const schema = z.object({
    topicId: z.number(),
    keyVerify: z.string().transform(from),
    keyWrapped: z.string().transform(from),
    messageData: z.string().transform(from),
    messageVector: z.string().transform(from),
}).strict()

export default server(async request => {
    const arrayBuffer = await request.arrayBuffer()
    const data = schema.parse(JSON.parse(Buffer.from(arrayBuffer).toString()))
    await auth(data.keyVerify, arrayBuffer, auSchema.parse(request.headers.get('Authorization')))
    const {id} = await post(data)
    return id
})