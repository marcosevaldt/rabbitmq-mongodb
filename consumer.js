const express = require('express');
const app = express();
const open = require('amqplib').connect('amqp://guest:guest@rabbit:5672');
const queue = 'tasks';
const MongoClient = require('mongodb').MongoClient;
let database;

// Connection URL
const databaseConfiguration = {
  url: 'mongodb://mongo-datalake:27017',
  options: { useUnifiedTopology: true, poolSize: 5000 },
  callback: (err, client) => {
    const db = database = client.db('datalake');
  },
};

// Use connect method to connect to the server
MongoClient.connect(
  databaseConfiguration.url,
  databaseConfiguration.options,
  databaseConfiguration.callback
);

open.then(conn => {
  return conn.createChannel();
}).then(ch => {
  ch.prefetch(1);
  return ch.assertQueue(queue, { durable: true }).then(ok => {
    return ch.consume(queue, async msg => {
      if (msg !== null) {

        const message = JSON.parse(msg.content.toString());

        const dateNow = new Date();
        const consumedAt = dateNow.toISOString();

        const created = await database.collection(message.api).insertOne(
          {
            ...message,
            consumedAt,
          }
        );

        ch.ack(msg);
      }
    }, { noAck: false });
  });
}).catch(console.warn);

app.listen(process.env.NODE_PORT);
