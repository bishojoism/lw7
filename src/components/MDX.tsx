import {MDXRemote} from "next-mdx-remote";
import {serialize} from "next-mdx-remote/serialize";
import Await from "@/components/Await";
import RefTopic from "@/components/RefTopic";
import RefComment from "@/components/RefComment";
import {memo} from "react";
import "github-markdown-css";
import Anchor from "@/components/Anchor";

function MDX({children}: { children: string }) {
    return (
        <Await fn={() => serialize(children)}>
            {res =>
                <article className="markdown-body max-h-32 overflow-auto" style={{background: 'transparent'}}>
                    <MDXRemote{...res} components={{RefTopic, RefComment, a: (props: any) => <Anchor {...props}/>}}/>
                </article>
            }
        </Await>
    )
}

export default memo(MDX)