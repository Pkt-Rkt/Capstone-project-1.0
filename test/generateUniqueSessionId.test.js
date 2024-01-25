(async () => {
    const chai = await import('chai');
    const expect = chai.expect;
    const { generateUniqueSessionId } = require('../path-to-your-file');
  
    describe('generateUniqueSessionId', function() {
      it('should generate a unique session ID', function() {
        const sessionId = generateUniqueSessionId();
        expect(sessionId).to.be.a('string');
        expect(sessionId).to.match(/\d+-[a-z0-9]+/);
      });
    });
  })();
  