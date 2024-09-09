import Page from "@/app/topic/[topicId]/page";
import {useState} from "react";
import {Button} from "@/components/ui/button";

export default function RefTopic({children}: { children: string }) {
    const [open, setOpen] = useState(false)
    return (
        <>
            <Button onClick={() => setOpen(!open)}>{">"}{children}</Button>
            {open && <Page params={{topicId: children}}/>}
        </>
    )
}