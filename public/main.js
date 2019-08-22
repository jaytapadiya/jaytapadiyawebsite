var express = require("express");
var ig = require('instagram-node').instagram();
var app = express();
var request = require('request');

var redirect_uri = 'http://localhost:8081/handleauth';



app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/'));

var accessToken;
var init = false;


ig.use({
    client_id: "d436e1b21361400386143d77c5623bfd",
    client_secret: "4facfdc75ad34c759679e106a79cfa1f"
});

exports.authorize_user = function(req, res) {
    // var url = ig.get_authorization_url(redirect_uri, { scope: ['likes'], state: 'a state' });
    // request({url: url, json: false}, function(err,res,body){
    //     if (!err) {
    //         exports.handleauth(req,res);
    //     }
    // });
    res.redirect(ig.get_authorization_url(redirect_uri, {scope: ['likes'], state: 'a state' }));
};

app.get('/authorize_user', exports.authorize_user);

exports.handleauth = function(req, res) {
    ig.authorize_user(req.query.code, redirect_uri, function(err, result) {
        if (err) {
            console.log("handleauth error: " + err.body);
            //res.send("Didn't work");
        } else {
            console.log('Yay! Access token is ' + result.access_token);
            accessToken = result.access_token;
            res.redirect("/");
            //res.send('You made it!!');
        }
    });
};

app.get('/handleauth', exports.handleauth);






app.get('/', function(req,res) {
    app.set('title', "Jay Tapadiya");
    if (!init) {
        init = true;
        res.redirect("/authorize_user");
    }
    var url = "https://api.instagram.com/v1/users/self/media/recent/?access_token=" + accessToken + "&count=30";
    request({
        url: url,
        json: true
    }, function (error, response, body) {

        if (!error && response.statusCode === 200) {
            res.render(__dirname + "/main", {instagram:body.data});
        }
    });
});

app.get('/photos', function(req,res) {
    var url = "https://api.instagram.com/v1/users/self/media/recent/?access_token=" + accessToken + "&count=30";
    request({
        url: url,
        json: true
    }, function (error, response, body) {

        if (!error && response.statusCode === 200) {
            res.render(__dirname + "/photos", {instagram:body.data});
        }
    });

});

app.get('/*', function(req,res) {
    res.set('title', "abc");
    res.send("404 page not here :C");
});

var server = app.listen(8081, function() {});
