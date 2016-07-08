'use strict';

// node-rest-client https://www.npmjs.com/package/node-rest-client
const json2html = require('node-json2html');
const RestClient = require('node-rest-client').Client;

let aws = require('aws-sdk');
let s3 = new aws.S3({ apiVersion: '2006-03-01' });

const ouput_header = '<tr><th>ID</th><th>Namespace</th><th>Name</th><th>Description</th><th>Visibility</th><th>Status</th></tr>'

const transform = {
    tag: 'tr',
    children: [{
        tag: 'td',
        html: '${id}'
    }, {
        tag: 'td',
        html: '${namespace}'
    }, {
        tag: 'td',
        html: '<a href="https://dtr.cucloud.net/repositories/${namespace}/${name}/details">${name}</a>'
    }, {
        tag: 'td',
        html: '${shortDescription}'
    }, {
        tag: 'td',
        html: '${visibility}'
    }, {
        tag: 'td',
        html: '${status}'
    }]
};

var dtr_rest_callback = function(data, response) {

  var filtered_data = data.repositories.filter( function(item) {
    return item.visibility === 'public';
  });

  // console.log(filtered_data);

  var x = '<table>'
          + ouput_header
          + json2html.transform(filtered_data, transform)
          + '</table><p>Updated at '
          + new Date().toISOString()
          + '</p>';

  // parsed response body as js object
  // console.log(data);
  //
  // console.log('---------------------------------------------------');
  // console.log(x);
  // console.log('---------------------------------------------------');

  var s3Params = {
    Bucket: 'cu-cs-docker-registry-html', /* required */
    Key: 'dtr.cs.cucloud.net.image-list.html', /* required */
    ACL: 'public-read',
    ContentType: 'text/html',
    Expires: new Date(),
    Body: x
  };
  s3.putObject(s3Params, function(err, data) {
    if (err) {
      console.log(err, err.stack); // an error occurred
    }
    else {
      console.log(data);           // successful response
    }
  });
}

exports.myhandler = (event, context) => {

  var s3Params = {
    Bucket: 'cu-cs-docker-registry-html',
    Key: 'dtr-credentials.json'
  };
  s3.getObject(s3Params, function(err, data) {
    if (err) {
      console.log(err, err.stack); // an error occurred
    }
    else {
      var options_auth = JSON.parse(data.Body.toString());
      // console.log(options_auth);
      const client = new RestClient(options_auth);

      client.get("https://dtr.cucloud.net/api/v0/repositories/cs",
          {parameters: {
              start: 0,
              limit: 9999}
          },
          dtr_rest_callback);
    }
  });
};
