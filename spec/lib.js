const { expect } = require('chai');
const { server: WebSocketServer } = require('websocket');
const { Server: HttpServer } = require('http');
const healthCheck = require('../index.js');

describe('Health Check library', () => {
  describe('checking a non-existing WebSocket runtime', () => {
    it('should report failure immediately', (done) => {
      healthCheck('ws://localhost:3569', 1000)
        .then(() => {
          done(new Error('Reported non-existing service as healthy'));
        })
        .catch((e) => {
          expect(e).to.be.an('error');
          expect(e.message).to.include('ECONNREFUSED');
          done();
      });
    }).timeout(100);
  });
  describe('checking a runtime that doesn\'t send capabilities', () => {
    let server = null;
    let wsServer = null;
    before((done) => {
      server = new HttpServer();
      wsServer = new WebSocketServer({
        httpServer: server
      });
      server.listen(3569, done);
    });
    after((done) => {
      if (!server) {
        return done();
      }
      server.close(done);
    });
    it('should report failure after timeout', (done) => {
      wsServer.once('request', (req) => {
        let connection = req.accept('noflo', req.origin);
        connection.once('message', (message) => {
          let msg = JSON.parse(message.utf8Data);
          expect(msg.protocol).to.equal('runtime');
          expect(msg.command).to.equal('getruntime');
        });
      });
      healthCheck('ws://localhost:3569', 500)
        .then(() => {
          done(new Error('Reported non-existing service as healthy'));
        })
        .catch((e) => {
          expect(e).to.be.an('error');
          expect(e.message).to.include('timed out');
          done();
      });
    }).timeout(1000);
  });
  describe('checking a runtime that sends capabilities', () => {
    let server = null;
    let wsServer = null;
    before((done) => {
      server = new HttpServer();
      wsServer = new WebSocketServer({
        httpServer: server
      });
      server.listen(3569, done);
    });
    after((done) => {
      if (!server) {
        return done();
      }
      server.close(done);
    });
    it('should report success', () => {
      const capabilities = {
        type: 'dummy-runtime',
        version: '0.5',
        capabilities: ['protocol:runtime'],
      };
      wsServer.once('request', (req) => {
        let connection = req.accept('noflo', req.origin);
        connection.once('message', (message) => {
          let msg = JSON.parse(message.utf8Data);
          expect(msg.protocol).to.equal('runtime');
          expect(msg.command).to.equal('getruntime');
          connection.sendUTF(JSON.stringify({
            protocol: 'runtime',
            command: 'runtime',
            payload: capabilities
          }));
        });
      });
      return healthCheck('ws://localhost:3569');
    }).timeout(1000);
  });
});
