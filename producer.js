const express = require('express')
const app = express()
const open = require('amqplib').connect('amqp://admin:admin@haproxy:5672');
const queue = 'tasks';


app.post('/produce', function (req, res) {
  open.then(function(conn) {
    return conn.createChannel();
  }).then(function(ch) {
    return ch.assertQueue(queue, { durable: true }).then(function(ok) {
      let msg = 'something';
      let date = new Date();
      ch.sendToQueue(queue, Buffer.from(msg), { persistent: true });
      console.log(" [x] '%s' Sent '%s'", date, msg);
      return ch.close();
    });
  }).catch(console.warn);

  res.send({});
})
 
app.listen(process.env.NODE_PORT);
