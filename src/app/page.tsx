import get from "@/prisma/get";
import Main from "@/client/Main";

export default async function Page() {
    return <Main initialData={await get({})}/>
}