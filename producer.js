const express = require('express')
const app = express()
const open = require('amqplib').connect('amqp://rabbit');
const queue = 'tasks';


app.post('/produce', function (req, res) {
  open.then(function(conn) {
    return conn.createChannel();
  }).then(function(ch) {
    return ch.assertQueue(queue, { durable: true }).then(function(ok) {
      console.log(new Date(), " -- INSERINDO NA FILA....");
      return ch.sendToQueue(queue, Buffer.from('something'), { persistent: true });
    });
  }).catch(console.warn);

  res.send({});
})
 
app.listen(process.env.NODE_PORT);
console.log(new Date(), " -- PRODUCER....");
