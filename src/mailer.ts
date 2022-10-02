require('dotenv').config();
const moment = require('moment')
const sgMail = require('@sendgrid/mail')
import { loggErrors } from './loggErrors';

//setup mongoose connection
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGOCONNECTION);

//get mongoose Schemas for retweets, own tweets and errors
import { retweetSchema } from './schemas/retweetsSchema';
import { ownTweetsSchema } from './schemas/ownTweetsSchema';
import { errorSchema } from './schemas/errorSchema';
import { createDateAsUTC } from './helpers';

//import interfaces
import { Tweet } from './interfaces/tweet.interface';
import { Error } from './interfaces/error.interface';

//set up mongoose models
const ownTweetsModel = mongoose.model('ownTweets', ownTweetsSchema);
const retweetModel = mongoose.model('Retweets', retweetSchema);
const errorModel = mongoose.model('errorSchema', errorSchema);

//calculate time objects for db queries
const getYesterdayStart = (): Date => {
  return moment().utcOffset(-2).subtract(1, 'days').startOf('day');
};

const getYesterdayEnd = (): Date => {
  return moment().utcOffset(-2).subtract(1, 'days').endOf('day')
};

//get all own tweets from yesterday
async function getOwnTweets (): Promise<Array<any>> {

  //db query for yesterdays own tweets
  const ownTweets: Array<Tweet> = await ownTweetsModel.find( { 'tweet.created_at': { $gte: getYesterdayStart(), $lte: getYesterdayEnd() } } )
  return ownTweets
};

//get all retweets from yesterday
async function getRetweets (): Promise<Array<Tweet>> {
  const retweets: Array<Tweet> = await retweetModel.find( { 'created_at': { $gte: getYesterdayStart(), $lte: getYesterdayEnd() } } );

  return retweets
};

//get all blocked Tweets from yesterday
async function getBlockedTweets (): Promise<Array<Error>> {
  const blockedTweets: Array<Error> = await errorModel.find( { 'category': 'BlockedWord', 'date': { $gte: getYesterdayStart(), $lte: getYesterdayEnd() } } );

  return blockedTweets
};

//get all tweets from blocked users from yesterday
async function getBlockedUserTweets (): Promise<Array<Error>> {
  const blockedUserTweets: Array<Error> = await errorModel.find( { 'category': 'BlockedUser', 'date': { $gte: getYesterdayStart(), $lte: getYesterdayEnd() } } );
  
  return blockedUserTweets
};

//sendgrid setup
sgMail.setApiKey(process.env.SENDGRID_API)

//create E-Mail-Message
const createMsg = async () => {
  const retweets: Array<Tweet> = await getRetweets();
  const ownTweets = await getOwnTweets();
  const blockedTweets: Array<Error> = await getBlockedTweets();
  const blockedUserTweets: Array<Error> = await getBlockedUserTweets();


  return {to: process.env.SENDGRID_RECIPIENT,
  from: process.env.SENDGRID_SENDER,
  subject: 'HohenloheBot Daily Update',
  text: `There have been ${ownTweets.length} own Tweets, ${retweets.length} Retweets and ${blockedTweets.length} blocked Tweets yesterday`,
  html: `<p>There have been ${ownTweets.length} own Tweets, ${retweets.length} Retweets and ${blockedTweets.length} blocked Tweets yesterday.</p>
  <p>These are the tweets:
  ${ownTweets.map(tweet => `<br>${tweet.tweet.text} with ${tweet.tweet.favorite_count} Likes<br>`)}</p>
  <p>These are the retweets:
  ${retweets.map(retweet => `<br><b>Author</b>: ${retweet.retweeted_status.user.screen_name}<br>
  <b>Text</b>: ${retweet.retweeted_status.text}<br>`)}</p>
  <p>These are the blockedTweets:
  ${blockedTweets.map(blockedTweet => `<br><b>Author</b>: ${blockedTweet.tweet.user.screen_name}<br>
  <b>Text</b>: ${blockedTweet.tweet.text}`)}</p>
  <p>These are the tweets by blockedUsers:
  ${blockedUserTweets.map(blockedUserTweet => `<br><b>Author</b>: ${blockedUserTweet.tweet.user.screen_name}<br>
  <b>Text</b>: ${blockedUserTweet.tweet.text}`)}</p>
  `
  }
};

//send daily statistics about own tweets and retweets
export async function sendDailyMail () {
  const msg = await createMsg()
  sgMail
    .send(msg)
    .then(() => {
      console.log('Email sent')
    })
    .catch((err) => {
      loggErrors( {category: 'Mailer', message: err } )
    })
};

//send notification mail on restart
const sendNotificationMail = async () => {
  sgMail
    .send({to: process.env.SENDGRID_RECIPIENT,
      from: process.env.SENDGRID_SENDER,
      subject: 'Hohenlohe Bot restarted',
      text: `Hohenlohe Bot was restarted at ${createDateAsUTC()}`,
      html: `Hohenlohe Bot was restarted at ${createDateAsUTC()}`
    })
    .then(() => {
      console.log('Notification Mail sent')
    })
    .catch((err) => {
      loggErrors( {category: 'Mailer', message: err } )
    })
};   

sendNotificationMail();