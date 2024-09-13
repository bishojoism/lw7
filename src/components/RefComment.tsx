import Page from "@/app/comment/[commentId]/page";
import {useState} from "react";
import {Button} from "@/components/ui/button";

export default function RefComment({children}: { children: string }) {
    const [open, setOpen] = useState(false)
    return (
        <>
            <Button size="sm" onClick={() => setOpen(!open)}>{"#"}{children}</Button>
            {open && <Page params={{commentId: children}}/>}
        </>
    )
}