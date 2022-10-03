require('dotenv').config();
import { connect, model } from 'mongoose';
connect(process.env.MONGOCONNECTION);

//get mongoose Schema for retweets
import { ownTweetsSchema } from './schemas/ownTweetsSchema';

import { createDateAsUTC } from './helpers';
import { loggErrors } from './loggErrors';

//interfaces
import { Tweet } from "./interfaces/tweet.interface";

//create mongoose model
const ownTweetsModel = model('ownTweets', ownTweetsSchema);

export function loggOwnTweets (tweet: Tweet, category: string): void {
    const newOwnTweet = new ownTweetsModel({

        category: category,
        tweet: {
            created_at: createDateAsUTC(),
            id: tweet.id,
            id_str: tweet.id_str,
            text: tweet.text,
            truncated: tweet.truncated,
            entities: {
            hashtags: tweet.entities.hashtags,
            symbols: tweet.entities.symbols,
            user_mentions: tweet.entities.user_mentions,
            urls: tweet.entities.urls
            },
            source: tweet.source,
            in_reply_to_status_id: tweet.in_reply_to_status_id,
            in_reply_to_status_id_str: tweet.in_reply_to_status_id_str,
            in_reply_to_user_id: tweet.in_reply_to_user_id,
            in_reply_to_user_id_str: tweet.in_reply_to_status_id_str,
            in_reply_to_screen_name: tweet.in_reply_to_screen_name,
            user: {
            id: tweet.user.id,
            id_str: tweet.user.id_str,
            name: tweet.user.name,
            screen_name: tweet.user.screen_name,
            location: tweet.user.location,
            description: tweet.user.description,
            url: tweet.user.url,
            entities: { 
                description: tweet.user.entities.description
            },
            protected: tweet.user.protected,
            followers_count: tweet.user.followers_count,
            friends_count: tweet.user.friends_count,
            listed_count: tweet.user.listed_count,
            created_at: tweet.user.created_at,
            favourites_count: tweet.user.favourites_count,
            verified: tweet.user.verified,
            statuses_count: tweet.user.statuses_count,
            contributors_enabled: tweet.user.contributors_enabled,
            is_translator: tweet.user.is_translator,
            is_translation_enabled: tweet.user.is_translation_enabled,
            profile_background_color: tweet.user.profile_background_color,
            profile_background_tile: tweet.user.profile_background_tile,
            profile_banner_url: tweet.user.profile_banner_url,
            profile_link_color: tweet.user.profile_link_color,
            profile_sidebar_border_color: tweet.user.profile_sidebar_border_color,
            profile_sidebar_fill_color: tweet.user.profile_sidebar_fill_color,
            profile_text_color: tweet.user.profile_text_color,
            profile_use_background_image: tweet.user.profile_use_background_image,
            has_extended_profile: tweet.user.has_extended_profile,
            default_profile: tweet.user.default_profile,
            default_profile_image: tweet.user.default_profile_image,
            following: tweet.user.following,
            follow_request_sent: tweet.user.follow_request_sent,
            notifications: tweet.user.notifications,
            translator_type: tweet.user.translator_type,
            withheld_in_countries: tweet.user.withheld_in_countries
            },
            geo: tweet.geo,
            coordinates: tweet.coordinates,
            place: tweet.place,
            is_quote_status: tweet.is_quote_status,
            retweet_count: tweet.retweet_count,
            favorite_count: tweet.favorite_count,
            favorited: tweet.favorited,
            retweeted: tweet.retweeted,
        }
    });
   
    newOwnTweet.save().then(response => console.log(response))
    .catch(err => loggErrors( {category: 'SaveTweetToDB', message: err, tweet: tweet } ));
};