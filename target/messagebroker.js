const amqp = require('amqplib');
require('dotenv').config();
const uri = process.env.BROKER_URL || 'amqp://localhost:5672';
const listento = 'target_image_sent';

class MessageHandler {
  constructor() {
    this.channel = null;
  }

  async startListening() {
    try {
      const connection = await amqp.connect(uri);
      this.channel = await connection.createChannel();
      console.log('Connected to RabbitMQ');
      console.log('Waiting for messages...');
      
      await this.channel.assertExchange(listento, 'fanout', { durable: false });
      await this.channel.assertQueue('', { exclusive: false });
      await this.channel.bindQueue('', listento, '');
      
      await this.channel.consume('', message => {
        let msg = JSON.parse(message.content.toString());
        console.log(`${msg} recieved`);
      });
      
    } catch (error) {
      console.log('Error in starting listener:', error);
    }
  }

  async publish(publishTo ,msg) {
    try {
      console.log('Running...');
      const connection = await amqp.connect(uri);
      const channel = await connection.createChannel();
      
      await channel.assertExchange(publishTo, 'fanout', { durable: false });
      await channel.publish(publishTo, '', Buffer.from(JSON.stringify(msg)));
      
      console.log('Message is naar queue verzonden: ' + msg);
    } catch (error) {
      console.log('Error in publisher:', error);
    }
  }
}

module.exports = MessageHandler;