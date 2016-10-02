var express = require('express');
var bodyParser = require('body-parser');
var SparkPost = require('sparkpost');

var app = express();

app.set('port', process.env.PORT || 3000);
app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.send('Hello World');
});


/**
  Takes data from the relay_message event and Giphy API response and sends
  an email response back to the sender
**/
var sendResponse = function(data) {
  // The API Key in the SPARKPOST_API_KEY enviroment variable will be used
  // to create the client
  var client = new SparkPost();
  client.transmissions.send({
    transmissionBody: {
      campaignId: 'New EmberDog Friends',
      content: {
        template_id: 'ember1'
      },
      recipients: [{ address: { email: data.msg_from } }]
    }
  }, function(err, res) {
    if (err) {
      console.log(err);
    } else {
      console.log('EmberDog replied to: ', data.friendly_from);
    }
  });
};


var processRelayMessage = function(data) {
  console.log('New EmberDog Friend: ', data.friendly_from);
  console.log('What My Friend Said: ', data.content_html)
  sendResponse(data);
};
/**
  Defines the endpoint that will accept batches from SparkPost
**/
app.post('/incoming', function(req, res) {
  // SparkPost expects a 200 response, send it before processing data
  // If you are storing data, do it before returning a response
  res.sendStatus(200);
  var batch = req.body;
  // A batch could contain up to 10,000 events
  for(var i=0; i<batch.length; i++) {
    // For this application, we can safely assume the batch will only
    // contain relay_message events
    processRelayMessage(batch[i].msys.relay_message);
  }
});

app.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
