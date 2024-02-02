// Set up Chai and Chai-HTTP for testing HTTP endpoints
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app.js');
const expect = chai.expect;

chai.use(chaiHttp);

// Test suite for Express routes
describe('Express Routes', function() {

  // Test suite for GET /login route
  describe('GET /login', function() {
    it('should return the login page', function(done) {
      chai.request(app)
        .get('/login')
        .end(function(err, res) {
          expect(res).to.have.status(200);
          expect(res).to.be.html;
          done();
        });
    });
  });

  // Test suite for POST /login route
  describe('POST /login', function() {
    it('should authenticate a user with valid credentials', function(done) {
      chai.request(app)
        .post('/login')
        .send({ username: 'validUsername', password: 'validPassword' })
        .end(function(err, res) {
          expect(res).to.have.status(302); // Redirects upon successful login
          expect(res).to.redirectTo('/index.html'); // Verify the redirection URL
          done();
        });
    });

    // Test case for failed authentication due to invalid credentials
    it('should reject login with invalid credentials', function(done) {
      chai.request(app)
        .post('/login')
        .send({ username: 'invalidUsername', password: 'invalidPassword' })
        .end(function(err, res) {
          expect(res).to.have.status(401);
          done();
        });
    });
  });

  // Test suite for GET /signup route
  describe('GET /signup', function() {
    it('should return the signup page', function(done) {
      chai.request(app)
        .get('/signup')
        .end(function(err, res) {
          expect(res).to.have.status(200);
          expect(res).to.be.html;
          done();
        });
    });
  });

  // Test suite for POST /signup route
  describe('POST /signup', function() {
    it('should create a new user with valid credentials', function(done) {
      chai.request(app)
        .post('/signup')
        .send({ username: 'newUser', password: 'newPassword', confirmPassword: 'newPassword' })
        .end(function(err, res) {
          expect(res).to.have.status(302); // Redirects upon successful signup
          expect(res).to.redirectTo('/index.html'); // Verify the redirection URL
          done();
        });
    });

    // Test case for failed signup due to missing credentials
    it('should reject signup with missing credentials', function(done) {
      chai.request(app)
        .post('/signup')
        .send({ username: '', password: '', confirmPassword: '' })
        .end(function(err, res) {
          expect(res).to.have.status(400);
          done();
        });
    });

    // Test case for failed signup due to mismatched passwords
    it('should reject signup with mismatched passwords', function(done) {
      chai.request(app)
        .post('/signup')
        .send({ username: 'mismatchedUser', password: 'password123', confirmPassword: 'password456' })
        .end(function(err, res) {
          expect(res).to.have.status(400);
          done();
        });
    });

    // Test case for failed signup due to an existing username
    it('should reject signup with an existing username', function(done) {
      chai.request(app)
        .post('/signup')
        .send({ username: 'existingUser', password: 'existingPassword', confirmPassword: 'existingPassword' })
        .end(function(err, res) {
          expect(res).to.have.status(409);
          done();
        });
    });
  });
});