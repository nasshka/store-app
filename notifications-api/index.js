const express = require("express");
const amqp = require("amqplib");

const app = express();

const accountSid = "AC647a7d08fe868330a057f1cddb0ebb58";
const authToken = "b401fd2d89d8b36e202097ddc537a0f1";

const client = require("twilio")(accountSid, authToken);

async function connect() {
  try {
    const connection = await amqp.connect(
      "amqp://rabbitmq-cluster-ip-service:5672"
    );
    const channel = await connection.createChannel();
    const result = channel.assertQueue("jobs");
    channel.consume("jobs", (message) => {
      console.log({ message: message.content.toString() });
      client.messages
        .create({
          body: "Your order is out for delivery",
          from: "+17142024930",
          to: message.content.toString(),
        })
        .then((message) => console.log(message.sid))
        .catch((err) => {
          console.log({ err });
        });
      channel.ack(message);
    });
  } catch (error) {
    console.log({ error });
  }
}

connect();

app.listen(5001, () => {
  console.log("Listening on PORT 5001");
});
