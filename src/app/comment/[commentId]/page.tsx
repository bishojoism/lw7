import Main from "@/client/comment/Main";
import get from "@/prisma/comment/get";

export default async function Page({params: {commentId}}: { params: { commentId: string } }) {
    const id = Number(commentId)
    return <Main commentId={id} initialData={await get({id})}/>
}