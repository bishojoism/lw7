import {NextRequest, NextResponse} from "next/server";

export default <T>(handler: (request: NextRequest) => Promise<T>) => (request: NextRequest) => handler(request)
    .then(value => ({value}))
    .catch(reason => {
        if (reason instanceof Error) {
            const {name, message, stack} = reason
            return {reason: {name, message, stack}}
        }
        return {reason: {name: 'UnknownError', message: String(reason)}}
    })
    .then(value => NextResponse.json(value))