import {useState} from "react";

export default function Getter<T>({initialData}: { initialData: T }) {
    const [data, setData] = useState<T>(initialData)
    return null
}