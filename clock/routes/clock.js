const MessageHandler = require('../messagebroker');

class ClockService {
    constructor() {
        this.endTime = null;
        this.messageHandler = new MessageHandler();

        this.messageHandler.startListening(this.onMessageReceived.bind(this));
    }

    async onMessageReceived(parsedMessage) {
        console.log('Message received:', parsedMessage);
        const targetEndTime = new Date(parsedMessage.deadline); 
        this.startClock(targetEndTime, parsedMessage.id);
    }

    startClock(targetEndTime, targetid) {
        this.endTime = targetEndTime;
        const currentTime = new Date();

        const timeRemaining = this.endTime - currentTime;
        if (timeRemaining > 0) {
            setTimeout(() => {
                console.log("Target has ended!");
                this.messageHandler.publish('target.score.requested', { message: 'Target has ended!', targetid: targetid });
            }, timeRemaining);
        } else {
            console.log("Target has already ended!");
            this.messageHandler.publish('target.score.requested', { message: 'Target has already ended!', targetid: targetid});
        }

        console.log(`Clock started with target end time: ${this.endTime}`);
        // which is in 
        console.log(`Time remaining: ${timeRemaining} ms`);
    }
}

module.exports = ClockService;