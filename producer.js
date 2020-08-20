const express = require('express');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const app = express();
const open = require('amqplib').connect('amqp://admin:admin@haproxy:5672');
const queue = 'tasks';


app.post('/produce', jsonParser, (req, res) =>  {
  open.then(conn => {
    return conn.createChannel();
  }).then(ch => {
    return ch.assertQueue(queue, { durable: true }).then(ok => {
      const dateNow = new Date();
      const producedAt = dateNow.toISOString();

      const msg = { ...req.body, producedAt };

      const msgString = JSON.stringify(msg);

      ch.sendToQueue(queue, Buffer.from(msgString), { persistent: true });

      return ch.close();
    });
  }).catch(console.warn);

  res.send({});
})

app.listen(process.env.NODE_PORT);
