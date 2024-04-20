import Main from "@/client/topic/Main";
import get from "@/prisma/topic/get";

export default async function Page({params: {topicId}}: { params: { topicId: string } }) {
    const id = Number(topicId)
    return <Main topicId={id} initialData={await get({id})}/>
}
