import { User } from "./user.interface";

export interface Tweet {
    created_at: Date;
    id: number;
    id_str: string;
    text: string;
    truncated: boolean;
    entities: {
        hashtags: Array<string>;
        symbols: Array<string>;
        user_mentions: Array<string>;
        urls: Array<string>
    };
    source: string;
    in_reply_to_status_id: number;
    in_reply_to_status_id_str: string;
    in_reply_to_user_id: number;
    in_reply_to_user_id_str: string;
    in_reply_to_screen_name: string;
    user: User
    geo: string;
    coordinates: object;
    place: object;
    is_quote_status: boolean,
    retweet_count: number;
    favorite_count: number;
    favorited: boolean;
    retweeted: boolean;
    retweeted_status: {
            created_at: Date;
            id: number;
            id_str: string;
            text: string;
            truncated: boolean;
            entities: {
                hashtags: Array<string>;
                symbols: Array<string>;
                user_mentions: Array<string>;
                urls: Array<string>
            },
            source: string;
            in_reply_to_status_id: number;
            in_reply_to_status_id_str: string;
            in_reply_to_user_id: number;
            in_reply_to_user_id_str: string;
            in_reply_to_screen_name: string;
            user: User
            geo: string;
            coordinates: object;
            place: object;
            is_quote_status: boolean,
            retweet_count: number;
            favorite_count: number;
            favorited: boolean;
            retweeted: boolean;
        },
    }
