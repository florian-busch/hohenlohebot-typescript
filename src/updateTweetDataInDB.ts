require('dotenv').config();
import { Tweet } from './interfaces/tweet.interface';
import { loggErrors } from './loggErrors';

//setup Twit
const Twit = require('twit');
const T = new Twit({
  consumer_key: process.env.TWITTER_API_KEY,
  consumer_secret: process.env.TWITTER_API_SECRET,
  access_token: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGOCONNECTION);

//get Schema from schema file
import { ownTweetsSchema } from './schemas/ownTweetsSchema';

//Model setup
const ownTweetsModel = mongoose.model('ownTweets', ownTweetsSchema);

//update tweet likes and retweets in db
const updateOneTweetInDB = (tweet: Tweet): void => {
  const query = { 'tweet.id_str': tweet.id_str };
  const options = { new: true }
  ownTweetsModel.findOneAndUpdate(
    query, 
    {
      'tweet.favorite_count': tweet.favorite_count,
      'tweet.retweet_count': tweet.retweet_count,
    },
    options, function (err, doc) {
      if (err == 'Error: No status found with that ID.') {
        loggErrors( {category: 'DbUpdates', message: err, tweet: tweet } )
      } else {
        console.log(doc)
      }
  });
};

//delete tweets in DB that can't be found on twitter anymore and logg error
const deleteTweet = async (ID: string): Promise<void> => {
  ownTweetsModel.findOneAndDelete( { 'tweet.id_str': ID }, function (err, doc) {
    if (err) {
      loggErrors( {category: 'Delete', message: err, tweet: doc.tweet } );
    } else {
      loggErrors( {category: 'MissingID', message: 'No tweet found with that ID on Twitter. DB-Entry deleted', tweet: doc.tweet } )
    }
  })
};

//get IDs from own tweets (not retweets) from db
const getTweetIDsFromDB = async (): Promise<Array<string>> => {
  let IDs: Array<string> = [];
  await ownTweetsModel.find()
    .then(tweets => tweets.forEach(data => IDs.push(data.tweet.id_str)))
    .catch(err => loggErrors( {category: 'TweetDB', message: err } ))

  return IDs;
};

//update data for all own tweets in db
export async function updateTweetData (): Promise<void> {
  //fetch tweet IDs
  const tweetIDs = await getTweetIDsFromDB();

  //for every tweet get current data then pass values to update function
  tweetIDs.forEach(ID => 
    T.get('statuses/show', { id: ID }, function (err, tweet, response) {
      //if no tweet is found on twitter with ID --> delete tweet from db and logg deletion with loggError
      if (err == 'Error: No status found with that ID.') {
        deleteTweet(ID)
      } else if (err) {
        loggErrors( { category: 'tweetRetrieving', message: err })
      } else {
        updateOneTweetInDB(tweet)
      };
    })
    );
};