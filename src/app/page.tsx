import get from "@/prisma/get";
import {short_name} from "@/../public/manifest.json";
import Post from "@/client/Post";
import Get from "@/client/Get";

export default async function Home() {
    return (
        <div className="container py-8">
            <title>{`首页|${short_name}`}</title>
            <h1 className="scroll-m-20 text-5xl font-extrabold tracking-tight">首页</h1>
            <Post/>
            <Get initialData={await get({})}/>
        </div>
    )
}
