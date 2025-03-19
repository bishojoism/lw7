import "@/app/globals.css";
import {Inter as FontSans} from "next/font/google";
import type {Metadata} from "next";
import {cn} from "@/lib/utils"
import {ReactNode} from "react";
import Providers from "@/app/Providers";
import {name, description, icons} from "@/../public/manifest.json";

export const metadata: Metadata = {
    title: name,
    description,
    manifest: '/manifest.json',
    icons: Array.from(icons).map(({src, sizes, type}) => ({url: src, sizes, type}))
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