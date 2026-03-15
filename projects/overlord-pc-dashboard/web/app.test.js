const { formatTime } = require('./app.js');

describe('formatTime', () => {
  it('should format seconds into a readable time string', () => {
    expect(formatTime(3661)).toBe('1h 1m 1s');
  });
});