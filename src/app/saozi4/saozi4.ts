import gilbert2d from "@/app/saozi4/gilbert2d";

export function encrypt({width, height, data}: ImageData) {
    const result = new Uint8ClampedArray(data.length);
    const curve = gilbert2d(width, height);
    const total = width * height;
    const offset = Math.round((Math.sqrt(5) - 1) / 2 * total);
    for (let i = 0; i < total; i++) {
        const [xa, ya] = curve[i], [xb, yb] = curve[(i + offset) % total];
        const ia = (xa + ya * width) << 2, ib = (xb + yb * width) << 2;
        result[ib] = data[ia];
        result[ib | 1] = data[ia | 1];
        result[ib | 2] = data[ia | 2];
        result[ib | 3] = data[ia | 3];
    }
    return new ImageData(result, width, height)
}

export function decrypt({width, height, data}: ImageData) {
    const result = new Uint8ClampedArray(data.length);
    const curve = gilbert2d(width, height);
    const total = width * height;
    const offset = Math.round((Math.sqrt(5) - 1) / 2 * total);
    for (let i = 0; i < total; i++) {
        const [xa, ya] = curve[i], [xb, yb] = curve[(i + offset) % total];
        const ia = (xa + ya * width) << 2, ib = (xb + yb * width) << 2;
        result[ia] = data[ib];
        result[ia | 1] = data[ib | 1];
        result[ia | 2] = data[ib | 2];
        result[ia | 3] = data[ib | 3];
    }
    return new ImageData(result, width, height)
}