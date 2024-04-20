import {Dispatch, SetStateAction, useEffect, useState} from "react";

export default function useLocalStorage(key: string, defaultValue?: string): [string | undefined, Dispatch<SetStateAction<string | undefined>>] {
    const [value, setValue] = useState(typeof window === 'undefined' ? defaultValue : window.localStorage.getItem(key) ?? defaultValue)
    useEffect(() => {
        if (typeof window === 'undefined') return
        if (value === undefined) window.localStorage.removeItem(key)
        else window.localStorage.setItem(key, value)
    }, [value])
    return [value, setValue]
}