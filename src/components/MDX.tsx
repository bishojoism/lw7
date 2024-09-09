import {MDXRemote} from "next-mdx-remote";
import {serialize} from "next-mdx-remote/serialize";
import Await from "@/components/Await";
import RefTopic from "@/components/RefTopic";
import RefComment from "@/components/RefComment";
import {memo} from "react";
import "github-markdown-css";

function MDX({children}: { children: string }) {
    return (
        <Await fn={() => serialize(children)}>
            {res => <article className="markdown-body p-4"><MDXRemote {...res} components={{RefTopic, RefComment}}/></article>}
        </Await>
    )
}

export default memo(MDX)