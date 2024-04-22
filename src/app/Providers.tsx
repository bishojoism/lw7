'use client'

import {ReactNode, useEffect} from "react";
import {useMediaQuery} from "react-responsive";

export default function Providers({children}: { children: ReactNode }) {
    const dark = useMediaQuery({query: '(prefers-color-scheme: dark)'})
    useEffect(() => {
        if (dark) document.documentElement.classList.add('dark')
        else document.documentElement.classList.remove('dark')
    }, [dark])
    return children
}