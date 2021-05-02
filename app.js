const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql'); // Used to intercept requests
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const con = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@restapiwithmongo.spews.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`;

// Models
const Event = require('./models/event');

const app = express();
app.use(bodyParser.json());

// schemas and resolvers
app.use('/graphql', graphqlHTTP({
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    // All resolvers
    rootValue: {
        events: () => {
            return ['Hello', 'Badminton']
        },
        createEvent: (args) => {
            console.log(args)
            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: args.eventInput.price,
                date: new Date(args.eventInput.date),
            });
            // args are got from the RootMutation defined
            return event
                .save()
                .then(result => {
                    console.log('Event created successfully', result);
                    return { ...result._doc };
                })
                .catch(e => {
                    console.log('Error creating event', e);
                    throw e;
                });
        }
    },
    graphiql: true,
}));

mongoose.connect(con).then(() => {
    app.listen(3000)
}).catch(e => {
    console.log('Connection error', e)
});
