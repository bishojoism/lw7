import prisma from "@/prisma";

export default (commentator: boolean, id: number) =>
    commentator ?
        prisma.comment.findUniqueOrThrow({
            where: {id},
            select: {
                keyVerify: true
            }
        }).then(({keyVerify}) => keyVerify) :
        prisma.comment.findUniqueOrThrow({
            where: {id},
            select: {
                Topic: {
                    select: {
                        keyVerify: true
                    }
                }
            }
        }).then(({Topic: {keyVerify}}) => keyVerify)