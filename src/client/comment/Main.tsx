import get from "@/prisma/comment/get";
import client from "@/client";
import {z} from "zod";

const poster = client(z.undefined())
const getter = client(z.object({
    parent: z.object({
        id: z.number(),
        create: z.number(),
        message: z.string()
    }),
    create: z.number(),
    keyWrapped: z.string(),
    messageData: z.string(),
    messageVector: z.string(),
    list: z.object({
        id: z.number(),
        create: z.number(),
        commentator: z.boolean(),
        messageData: z.string(),
        messageVector: z.string()
    }).strict().array()
}).strict())
export default function Main({commentId, initialData}: {
    commentId: number
    initialData: Awaited<ReturnType<typeof get>>
}) {
    return null
}