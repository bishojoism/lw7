'use client'

import {ReactNode, useEffect} from "react";
import {useMediaQuery} from "react-responsive";

export default function Providers({children}: { children: ReactNode }) {
    const dark = useMediaQuery({query: '(prefers-color-scheme: dark)'})
    useEffect(() => {
        if (dark) document.documentElement.classList.add('dark')
        else document.documentElement.classList.remove('dark')
        if (Notification) Notification.requestPermission().then(permission => {
            console.log(`获取通知权限${permission === 'granted' ? '成功' : permission === 'denied' ? '失败' : '待定'}`)
        })
    }, [dark])
    return children
}