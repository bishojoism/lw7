import get from "@/prisma/comment/get";

export default function Main({commentId, initialData}: {
    commentId: number
    initialData: Awaited<ReturnType<typeof get>>
}) {
    return null
}