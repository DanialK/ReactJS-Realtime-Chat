/**
 * Created by toobler on 21/5/15.
 */

config = {
    solr : {
        baseUrl: "http://localhost:8983",
        collection: "gettingstarted"
    }
}

module.exports.route = function (app) {
    app.get('/get', function (req, res) {
        request.get({
            uri: config.solr.baseUrl + 'solr/'+config.solr.collection+'/select?q=' + query,
            headers: {'Content-Type': 'application/json'}
        }, function (error, response, body) {
            if (!error) {
                body = JSON.parse(body);
                callback(null, body);
            } else {
                callback(error);
            }
        });
    });

    app.get('/post', function (req, res) {
        request.post({
            uri: config.solr.baseUrl + 'solr/'+config.solr.collection+'/update/json?commit=true',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        }, function (error, response, body) {
            body = JSON.parse(body);
            if (!error &&  !body.error) {
                return  callback();
            } else {
                return callback(error || body.error);
            }
        });

    });

}

