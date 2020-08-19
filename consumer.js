const express = require('express')
const app = express()
const open = require('amqplib').connect('amqp://rabbit');
const queue = 'tasks';
const MongoClient = require('mongodb').MongoClient;
let database;

// Connection URL
const databaseConfiguration = {
  url: 'mongodb://mongo-datalake:27017',
  options: { useUnifiedTopology: true, poolSize: 5000 },
  callback: function (err, client) {
    const db = database = client.db('datalake');
  },
};

// Use connect method to connect to the server
MongoClient.connect(databaseConfiguration.url, databaseConfiguration.options, databaseConfiguration.callback);
 
open.then(function(conn) {
  return conn.createChannel();
}).then(function(ch) {
  ch.prefetch(1);
  return ch.assertQueue(queue, { durable: true }).then(function(ok) {
    return ch.consume(queue, async function(msg) {
      if (msg !== null) {
        const created = await database.collection('producer').insertOne({ data: msg.content.toString() });
        console.log(" [x] Created '%s'", created.insertedId);
        ch.ack(msg);
      }
    }, { noAck: false });
  });
}).catch(console.warn);

app.listen(process.env.NODE_PORT);
