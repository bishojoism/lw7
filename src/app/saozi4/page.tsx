'use client';
import {useRef, useState} from "react";
import {Input} from "@/components/ui/input";
import {decrypt, encrypt} from "@/app/saozi4/saozi4";
import {Button} from "@/components/ui/button";

async function getImageData(img: HTMLImageElement) {
    const canvas = document.createElement('canvas')
    const {width, height} = img
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0, width, height)
    return ctx.getImageData(0, 0, width, height)
}

function setImageData(image: ImageData) {
    const canvas = document.createElement('canvas')
    const {width, height} = image
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')!
    ctx.putImageData(image, 0, 0)
    return canvas.toDataURL()
}

export default function Page() {
    const [url, _setUrl] = useState<string>()
    const setUrl = (newUrl: string) => {
        if (url !== undefined) URL.revokeObjectURL(url)
        _setUrl(newUrl)
    }
    const ref = useRef<HTMLInputElement>(null)
    const ref2 = useRef<HTMLImageElement>(null)
    return (
        <div className="container py-6 space-y-4">
            <title>图片臊子4</title>
            <div className="flex items-center justify-between">
                <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight">图片臊子4</h1>
            </div>
            <div className="flex items-center justify-around space-x-2">
                <Input ref={ref} type="file" accept="image/*" onInput={() => {
                    setUrl(URL.createObjectURL(ref.current!.files![0]))
                }}/>
                <Button disabled={url === undefined} onClick={async () => {
                    setUrl(setImageData(encrypt(await getImageData(ref2.current!))))
                }}>加密</Button>
                <Button disabled={url === undefined} onClick={async () => {
                    setUrl(setImageData(decrypt(await getImageData(ref2.current!))))
                }}>解密</Button>
            </div>
            <div className="flex items-center justify-around">
                <img ref={ref2} src={url} alt="图片"/>
            </div>
        </div>
    )
}