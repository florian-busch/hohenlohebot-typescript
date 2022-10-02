import { Tweet } from "./tweet.interface";

export interface Error {
    category: string,
    date?: Date,
    message?: string,
    tweet?: Tweet,
}