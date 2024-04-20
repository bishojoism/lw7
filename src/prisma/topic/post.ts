import prisma from "@/prisma";

export default (data: {
    topicId: number
    keyVerify: Buffer
    keyWrapped: Buffer
    messageData: Buffer
    messageVector: Buffer
}) => prisma.comment.create({data, select: {id: true}}).then(({id}) => id)