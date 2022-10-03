require('dotenv').config();
import { connect, model } from 'mongoose';

//get Schema from schema file
import { textSchema } from './schemas/textSchema';

//get helpers
import { createDateAsUTC } from './helpers';


//Model setup
connect(process.env.MONGOCONNECTION);
const Text = model('Text', textSchema);

//mark texts as already posted after they got tweeted
export async function markAsPosted (doc) {
  return await Text.updateOne( { _id: doc._id }, { already_posted: true, posted: createDateAsUTC() })
};

//get content for tweets from database based on category of tweet (vokabel or spruch)
export async function getDatabaseContent (category: string) {
  const doc = await Text.findOne({ category: `${category}`, already_posted: false });
    if (category == undefined) {
      return 'No document found';
    } else {
      return doc
    }
};


// // helper function to save new vokabel or spruch to database (import data before use)
// const { data } = require('../data/data')
// data.forEach(el => {
//   const textchen = new Text({ text: el.text, category: el.category, already_posted: false })
//   textchen.save().then(response => console.log(response))
// });
