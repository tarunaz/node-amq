var stompit = require('stompit');

var express = require('express');
var router = express.Router();
const log = require('tke-logger').getLogger(__filename);
router.use(require('body-parser').json());

const connectOptions = {
  'host': env('AMQ_SERVER', 'broker-amq-stomp-ssl-broker-amq.osedefaulttest.na.cobank2.corp').asString(),
  'port': 443,
  'ssl': true,
  'connectHeaders': {
    'host': '/',
    'login': AMQ_LOGIN,
    'passcode': AMQ_PASSCODE,
    'heart-beat': '5000,5000'
  }
};

router.post('/:branchNumber/:routeNumber/:batchNumber', function (req, res) {

  log.info('Publish function  Branch number', req.params.branchNumber);
  log.info('Publish function  routeNumber ', req.params.routeNumber);
  log.info('Publish function  batchNumber ', req.params.batchNumber);
  log.info('publish body', req.body);

  var sendHeaders = {
    'destination': 'planner-queue',
    'content-type': 'text/plain',
    'branchNumber': req.params.branchNumber,
    'routeNumber': req.params.routeNumber,
    'batchNumber': req.params.batchNumber
  };
  log.info('header', sendHeaders);
  stompit.connect(connectOptions, function (error, client) {

    if (error) {
      console.log('connect error ' + error.message);
      res.status(500).json(error);
      return;
    }
    var frame = client.send(sendHeaders);
    frame.write(JSON.stringify(req.body));
    frame.end();

    log.info('message sent');
    client.disconnect();

    res.json({
      message: 'Message posted'
    });

  });
});

module.exports = router;

