import {z} from "zod";

export default z.string().transform(arg => Number(arg))