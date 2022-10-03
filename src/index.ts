import { schedule } from 'node-cron';

//daily statistics mail
import { sendDailyMail } from './mailer';

//function for updating tweet data in database (likes and retweets)
import { updateTweetData } from './updateTweetDataInDB';

//function for getting blocked users
import { getBlockedUsers, sendTweet } from './twitter';

//function for checking if today is muswiese
import { checkIfTodayMuswiese } from './muswiesenContent';

/*//Cron-jobs to start different
//  tweets and get blocked users//*/

//get blocked users once at start and then once an hour
getBlockedUsers();
schedule("* 30 * * * *", function() {
  getBlockedUsers()
});

schedule("0 00 10 * * *", function() {
  updateTweetData()
});

//Muswiesentweet every sunday and thursday
schedule("0 33 16 * * 0,4", function() {
  if (checkIfTodayMuswiese()) {
    sendTweet('daysOfMuswiese')
  } else {
    sendTweet('MuswiesenCountdown')
  }
});

//Muswiesentweet every tuesday and saturday
schedule("0 33 10 * * 2,6", function() {
  if (checkIfTodayMuswiese()) {
    sendTweet('daysOfMuswiese')
  } else {
    sendTweet('MuswiesenCountdown')
  }
});

//Vokabel-Tweet every wednesday, friday and sunday at 4.12 pm
schedule("0 12 16 * * 3,5", function() {
  sendTweet('Vokabel');
});

//Spruch-Tweet every monday and thursday at 2.30 pm
schedule("0 30 13 * * 1,4", function() {
  sendTweet('Spruch');
});

//send daily mail with statistics about yesterdays tweets and retweets
schedule("0 30 9 * * *", function() {
  sendDailyMail()
});
