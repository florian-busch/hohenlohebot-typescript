require('dotenv').config();
import { connect, model } from 'mongoose';
connect(process.env.MONGOCONNECTION);

//get helpers
import {createDateAsUTC } from './helpers';

import { Error } from './interfaces/error.interface';

//get mongoose Schema for retweets
import { errorSchema } from './schemas/errorSchema';

//create mongoose model
const errorModel = model('errorSchema', errorSchema);

export function loggErrors (error: Error) {
    const newError = new errorModel({
        category: error.category,
        date: createDateAsUTC(),
        message: error.message,
        tweet: error.tweet,
    });
   
    newError.save().then(response => console.log(response))
    .catch(err => loggErrors( {category: 'LoggingError', message: err } ));
};