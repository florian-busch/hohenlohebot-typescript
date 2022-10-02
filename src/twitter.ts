require('dotenv').config();
const Twit = require('twit');

//logger functions
import { loggRetweets }from './loggRetweets';
import { loggOwnTweets } from './loggOwnTweets';
import { loggErrors } from './loggErrors';

//external functions for tweet content
import { getMuswiesenContent } from './muswiesenContent';
import { getDatabaseContent, markAsPosted } from './getDatabaseContent';

//interfaces
import { Tweet } from './interfaces/tweet.interface';

//setup Twit
const T = new Twit({
  consumer_key: process.env.TWITTER_API_KEY,
  consumer_secret: process.env.TWITTER_API_SECRET,
  access_token: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

//get list of blocked users -> will be checked before retweeting
let blocks: Array<number> = [];
export function getBlockedUsers () {
  T.get('blocks/ids', function (err, data, response) {
    if (err) {
      return console.log(err)
    } else {
      return blocks = data.ids}
    }
  )
};

//check tweet for words that should not be retweeted (returns true if one or more words are in tweet)
const blockedWords = process.env.BLOCKEDWORDS
//split blockedWords to turn string into array
export function checkForBlockedWords (tweet: string): boolean {
  return blockedWords.split(',').some(word => tweet.toLowerCase().includes(word));
};

//key words bot listens for
const retweetTriggers = process.env.RETWEETTRIGGERS;
//listen for tweets that include retweetTriggers
let stream = T.stream('statuses/filter', { track: retweetTriggers });
stream.on('tweet', gotTweet);

//retweet tweets from users that on bots block list and whose tweets that don't contain blocked words
function gotTweet(tweet: Tweet) {
  if (blocks.includes(tweet.user.id)) {
    loggErrors( {category: 'BlockedUser', message: `Blocked User with id: ${tweet.user.id}`, tweet: tweet } )
  } else if (checkForBlockedWords(tweet.text)) {
    loggErrors( { category: 'BlockedWord', message: `Blocked word in tweet: with id: ${tweet.text}`, tweet: tweet } )

    //if no blocked users and no blocked words --> retweet tweet
  } else if(!blocks.includes(tweet.user.id) && !checkForBlockedWords(tweet.text)) {
    T.post('statuses/retweet', { id: tweet.id_str }, retweeted);

    function retweeted(err, tweet, response) {
      //if error at retweeting --> logg error
      if (err) {
        console.log(err);
      } else {
        //Succesful retweet, logg retweet to db
        loggRetweets(tweet)
      };
    };
    //if other errors at retweeting
  } else {
    loggErrors( {category: 'ErrorRetweeting', tweet: tweet } );
  }
};
console.log('Bot listening');

//function for tweeting Muswiesentweet, Sprüche and Vokabeln
export async function sendTweet (category: string) {
  let content;
  if (category == 'MuswiesenCountdown') {
    content = await getMuswiesenContent();
  } else if (category == 'Vokabel' || category == 'Spruch' || category == 'daysOfMuswiese'  ) {
    content = await getDatabaseContent(category);
  };

  //If content was found in DB --> Send content in tweet, mark content as posted in database afterwards and logg content to db
  if (content != null) {
    T.post('statuses/update', { status: content.text }, (err, data, response) => {
        if (err) {
          let tweet = {
            text: content.text
          }
          loggErrors( {category: 'TweetPost', message: err, tweet: tweet.text } )
        } else {
          //mark tweet as posted in db and logg tweet to db
          console.log(data)
          markAsPosted(content);
          loggOwnTweets(data, category);
        }
      })
    } else {
      loggErrors( {category: 'TweetRetrieving', message: `No tweet in DB for category: ${category}` } )
    }
};

module.exports = { getBlockedUsers, checkForBlockedWords, sendTweet };