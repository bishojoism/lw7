import "@/app/globals.css";
import {Inter as FontSans} from "next/font/google";
import type {Metadata} from "next";
import {cn} from "@/lib/utils"
import {ReactNode} from "react";
import Providers from "@/app/Providers";
import {name, short_name} from "@/../public/manifest.json"

export const metadata: Metadata = {
    title: short_name,
    description: name
}

const fontSans = FontSans({
    subsets: ["latin"],
    variable: "--font-sans",
})

export default function RootLayout({children}: { children: ReactNode }) {
    return (
        <html lang="zh-CN">
        <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
        <Providers>
            {children}
        </Providers>
        </body>
        </html>
    )
}