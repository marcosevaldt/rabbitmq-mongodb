const express = require('express');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const app = express();
const open = require('amqplib').connect('amqp://guest:guest@rabbit:5672');
const queue = 'tasks';

app.get('/', jsonParser, (req, res) =>  {
  res.send('Hello World!');
});

app.post('/produce', jsonParser, (req, res) =>  {
  open.then(conn => {
    return conn.createChannel();
  }).then(ch => {
    return ch.assertQueue(queue, { durable: true }).then(ok => {
      const dateNow = new Date();
      const producedAt = dateNow.toISOString();

      let msg = { ...req.body, producedAt };

      if (Object.keys(req.body).length === 0) {
        msg = {
          ...msg,
          api: 'users',
          method: 'insert',
          data: {
            _id: 'uuid',
            phoneNumber: '+55 (51) 12345-1234',
            email: 't@t.com.br',
            name: 'Testinho Da Silva'
          }
        }
      }

      const msgString = JSON.stringify(msg);

      ch.sendToQueue(queue, Buffer.from(msgString), { persistent: true });

      return ch.close();
    });
  }).catch(console.warn);

  res.send({});
});

app.listen(process.env.NODE_PORT);
