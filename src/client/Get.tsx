'use client'

import get from "@/prisma/get";
import {useState} from "react";

export default function Get({initialData}: { initialData: Awaited<ReturnType<typeof get>> }) {
    const [data, setData] = useState(initialData)
    return null
}