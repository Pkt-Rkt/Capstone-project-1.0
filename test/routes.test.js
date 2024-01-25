(async () => {
    const chai = await import('chai');
    const chaiHttp = await import('chai-http');
    const app = require('../app.js'); // Make sure to export your app in the main file
  
    chai.default.use(chaiHttp.default);
  
    describe('Express Routes', function() {
      describe('GET /', function() {
        it('should render the index page', function(done) {
          chai.default.request(app)
            .get('/')
            .end(function(err, res) {
              chai.expect(res).to.have.status(200);
              chai.expect(res).to.be.html;
              done();
            });
        });
        //add more tests when needed
      });
    });
  })();
  