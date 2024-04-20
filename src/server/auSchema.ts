import {z} from "zod";
import from from "@/base64/from";

export default z.string().transform(from)