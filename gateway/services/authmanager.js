const MessageHandler = require('../messagebroker');
const User = require('../database/user');

class AuthManager {
  initalize() {
    this.messageHandler = new MessageHandler();
    this.messageHandler.startListening('user_registered', this.func.bind(this));
  }

  func = async (parsedMessage) => {
    console.log('Message received:', parsedMessage);

    // save the user to the database
    const { username, email, role, hashedpass } = parsedMessage;
    if (!username || !email || !role || !hashedpass) {
      console.error('Missing required fields');
      return;
    }

    const newUser = new User({
      username,
      email,
      role,
      password: hashedpass
    });

    try {
      await newUser.save();
      console.log('User saved to database');
    } catch (error) {
      console.error('Error saving user to database:', error);
    }
  }

}

module.exports = AuthManager;
