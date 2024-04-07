const ClockService = require('../routes/clock');

// Mock the MessageHandler class
jest.mock('../messagebroker', () => {
  return jest.fn().mockImplementation(() => ({
    startListening: jest.fn(),
    publish: jest.fn()
  }));
});

describe('ClockService', () => {
  let clockService;

  beforeEach(() => {
    clockService = new ClockService();
  });

  test('startClock should publish target ended message when time remaining is 0', () => {
    // Mock the current time to be equal to the target end time
    const targetEndTime = new Date();
    const message = { deadline: targetEndTime.toISOString(), id: '123' };
    const currentTime = new Date(targetEndTime);
    jest.spyOn(global, 'Date').mockImplementation(() => currentTime);

    const publishMock = jest.spyOn(clockService.messageHandler, 'publish');

    clockService.onMessageReceived(message);

    // Check if publish was called with the correct parameters
    expect(publishMock).toHaveBeenCalledWith('target.score.requested', { message: 'Target has already ended!', targetid: '123' });
  });

test('startClock should publish target ended message when time remaining is negative', () => {
    // Mock the current time to be after the target end time
    const targetEndTime = new Date();
    const message = { deadline: targetEndTime.toISOString(), id: '123' };
    const currentTime = new Date(targetEndTime);
    currentTime.setSeconds(currentTime.getSeconds() + 1);
    jest.spyOn(global, 'Date').mockImplementation(() => currentTime);

    const publishMock = jest.spyOn(clockService.messageHandler, 'publish');

    clockService.onMessageReceived(message);

    // Check if publish was called with the correct parameters
    expect(publishMock).toHaveBeenCalledWith('target.score.requested', { message: 'Target has already ended!', targetid: '123' });
});


});
