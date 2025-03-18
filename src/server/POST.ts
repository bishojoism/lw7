import server from "@/server";
import {z} from "zod";
import auth from "@/server/auth";
import from from "@/base64/from";
import auSchema from "@/server/auSchema";
import post from "@/prisma/post";

const schema = z.object({
    keyVerify: z.string().transform(from),
    keyWrap: z.string().transform(from),
    message: z.string()
}).strict()

export default server(async request => {
    const arrayBuffer = await request.arrayBuffer()
    const data = schema.parse(JSON.parse(Buffer.from(arrayBuffer).toString()))
    await auth(data.keyVerify, arrayBuffer, auSchema.parse(request.headers.get('Authorization')))
    return post(data)
})
