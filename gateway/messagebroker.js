const amqp = require('amqplib');
require('dotenv').config();
const uri = process.env.BROKER_URL || 'amqp://localhost:5672';

class MessageHandler {
  constructor() {
    this.connection = null;
    this.channel = null;
  }

  async initialize() {
    try {
      this.connection = await amqp.connect(uri);
      this.channel = await this.connection.createChannel();
      console.log('Connected to RabbitMQ');
    } catch (error) {
      console.error('Error in initializing RabbitMQ connection:', error);
      throw error; // Propagate the error to the caller for handling
    }
  }

  async startListening(queueName, onMessageReceived) {
    try {
      if (!this.channel) {
        await this.close();
        console.log('Channel not initialized. Initializing now...');
        await this.initialize();
      }
      await this.channel.assertExchange(queueName, 'fanout', { durable: false });
      await this.channel.assertQueue(queueName, { exclusive: false, durable: false });
      await this.channel.bindQueue(queueName, queueName, '');
      await this.channel.consume(queueName, async (message) => {
        try {
          if (!message) return; 
          const content = message.content.toString();
          const parsedMessage = JSON.parse(content);
          await onMessageReceived(parsedMessage);
          this.channel.ack(message); 
        } catch (error) {
          console.error('Error in message processing:', error);
          this.channel.nack(message); 
        }
      });
      console.log(`Listening for messages on queue: ${queueName}`);
    } catch (error) {
      console.error('Error in starting listener:', error);
      throw error;
    }
  }

  async publish(exchangeName, msg) {
    try {
      if (!this.channel) {
        await this.initialize();
      }
  
      await this.channel.assertExchange(exchangeName, 'fanout', { durable: false });
      await this.channel.publish(exchangeName, '', Buffer.from(JSON.stringify(msg)));
  
      console.log(`Message published to exchange ${exchangeName}:`, msg);
    } catch (error) {
      console.error('Error in publishing message:', error);
    }
  }

  async close() {
    try {
      if (this.connection) {
        await this.connection.close();
        console.log('Connection to RabbitMQ closed');
      }
    } catch (error) {
      console.error('Error in closing RabbitMQ connection:', error);
    }
  }
}

module.exports = MessageHandler;
