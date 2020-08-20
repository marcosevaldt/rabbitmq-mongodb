const express = require('express')
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()
const app = express()
const open = require('amqplib').connect('amqp://admin:admin@haproxy:5672');
const queue = 'tasks'


app.post('/produce', jsonParser, function (req, res) {
  open.then(function(conn) {
    return conn.createChannel();
  }).then(function(ch) {
    return ch.assertQueue(queue, { durable: true }).then(function(ok) {
      const msg = req.body;

      const msgString = JSON.stringify(msg);

      ch.sendToQueue(queue, Buffer.from(msgString), { persistent: true });

      console.log(" [x] '%s' Sent '%s'", msgString);

      return ch.close();
    });
  }).catch(console.warn);

  res.send({});
})

app.listen(process.env.NODE_PORT);
