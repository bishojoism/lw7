import Link from "next/link";
import {ReactNode} from "react";

export default function Anchor({href, children}: { href: string, children?: ReactNode }) {
    return (
        <Link
            className="text-[#1a0dab] visited:text-[#6c00a2] dark:text-[#8ab4f8] dark:visited:text-[#c58af9] hover:underline"
            href={href}
        >
            {children}
        </Link>
    )
}