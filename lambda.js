'use strict';

// node-rest-client https://www.npmjs.com/package/node-rest-client
const json2html = require('node-json2html');
const RestClient = require('node-rest-client').Client;
const client = new RestClient({
    connection: {
        rejectUnauthorized: false,
        headers: {
            "Content-Type": "application/json"
        }
    }
});

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
        html: '<a href="https://dtr.cs.cucloud.net/repositories/${namespace}/${name}/details">${name}</a>'
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

exports.myhandler = (event, context, callback) => {

    var rest_callback = function(data, response) {

      var x = '<table>'
              + ouput_header
              + json2html.transform(data.repositories, transform)
              + '</table><p>Updated at '
              + new Date().toISOString()
              + '</p>';

      // parsed response body as js object
      // console.log(data);
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
          callback(err, "failure");
        }
        else {
          console.log(data);           // successful response
          callback(null, "success");
        }
      });
    }

    client.get("https://dtr.cs.cucloud.net/api/v0/repositories/cs", {
        parameters: {
            start: 0,
            limit: 9999
        }}, rest_callback);

    // callback(null, "success");
    // callback('Something went wrong');
};
