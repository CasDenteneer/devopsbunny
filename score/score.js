const MessageHandler = require('./messagebroker');
const Attempt = require('./database/attempt');
const Target = require('./database/target');
require('dotenv').config();

const LISTENTO = process.env.LISTEN_TO || 'target.score.requested';
const PUBLISHTO = process.env.PUBLISH_TO || 'target.score.calculated';

class ScoreService {
    constructor() {
        this.messageHandler = new MessageHandler();
        this.messageHandler.startListening(LISTENTO, this.onMessageReceived.bind(this));
        this.messageHandler.startListening('target.uploaded', this.onTargetUploaded.bind(this));
        this.messageHandler.startListening('attempt.uploaded', this.onAttemptUploaded.bind(this));
    }

    onTargetUploaded(parsedMessage) {
        const { _id, targetImage, ownerId, location } = JSON.parse(parsedMessage);

        if (!targetImage || !ownerId || !location) {
            console.log('Missing required fields');        
        }
        
        const target = new Target({
            id: _id,
            targetImage: targetImage,
            ownerId,
            location
        });
        target.save();
        console.log('Target saved to database');
    }

    onAttemptUploaded(parsedMessage) {
        console.log('Attempt uploaded:', parsedMessage);
        const { targetId, participantId, image, id } = parsedMessage;
        const attempt = new Attempt({
            id,
            target: targetId,
            participantId,
            image
        });
        attempt.save();
        console.log('Attempt saved to database');
    }


    async onMessageReceived(parsedMessage) {
        console.log('Message received:', parsedMessage);
        parsedjson = JSON.parse(parsedMessage);
        this.calculateScore(parsedjson);
    }

    async calculateScore(parsedMessage) {
        console.log('Calculating score:', parsedMessage);

        // for each attempt in the database for the target, calculate the score
        // get all attempts for the target
        const attempts = await Attempt.find({ target: parsedMessage.targetid });
        console.log('Attempts:', attempts);

        // calculate the score
        let score = 0;
        for (let i = 0; i < attempts.length; i++) {
            score += Math.floor(Math.random() * 100);
        }

        // publish score
        this.messageHandler.publish(PUBLISHTO, { message: 'Score calculated!', score: score, targetid: parsedMessage.targetid});
    }
}

module.exports = ScoreService;