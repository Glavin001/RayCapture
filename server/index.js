// server.js (Express 4.0)
var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var path = require('path');
var fs = require('fs');
var spawn = require('child_process').spawn;

// Create Express app
var app = express();

// Config
var publicDir = path.resolve(__dirname, '../app');
var inDir = path.resolve(__dirname, '../app/in');
var outDir = path.resolve(__dirname, '../app/out');
var raytracerPath = path.resolve(__dirname, 'raytracer.o');

// Setup
app.use(express.static(publicDir)); // set the static files location /public/img will be /img for users
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.urlencoded({
        extended: false
    })) // parse application/x-www-form-urlencoded
app.use(bodyParser.json()) // parse application/json
app.use(methodOverride()); // simulate DELETE and PUT

// Ray Tracer
app.post('/api/scene/:name/:depthmin/:depthmax/:width/:height', function(req,
    res) {

    var sceneName = req.params.name;
    var sceneContents = req.body.contents;
    var depthMin = req.params.depthmin || 0;
    var depthMax = req.params.depthmax || 100;
    var width = req.params.width || 500;
    var height = req.params.height || 500;

    // Create file in `in/`
    var inFile = path.resolve(inDir, sceneName + '.txt');
    var outFile = path.resolve(outDir, sceneName + '.bmp');
    var depthFile = path.resolve(outDir, 'depth-'+sceneName + '.bmp');
    var normalFile = path.resolve(outDir, 'normals-'+sceneName + '.bmp');

    console.log("===================");
    console.log('Scene: ' + sceneName);
    console.log(sceneContents);

    fs.writeFile(inFile, sceneContents, function(err) {

        if (err) {
            console.error(err);
            return res.json({
                'error': err.message
            });
        }

        // Render using Raytracer
        // ./server/raytracer.o -input app/in/scene1.txt -output app/out/scene1.bmp -size 200 200
        var args = [
            '-input', inFile,
            '-output', outFile,
            '-size', width, height,
            '-depth', depthMin, depthMax, depthFile,
            '-normals', normalFile
        ];
        // console.log('args: ', args);
        var raytracer = spawn(raytracerPath, args);
        var log = "";
        raytracer.stderr.on('data', function(data) {
            log += data;
        });
        raytracer.stdout.on('data', function(data) {
            log += data;
        });
        raytracer.on('close', function(code) {
            // output here
            console.log(log);
            // Return to user
            return res.json({
                'imageName': sceneName,
                'imageUrl': '/out/' + sceneName + '.bmp',
                'depthImageUrl': '/out/' + 'depth-'+sceneName + '.bmp',
                'normalsImageUrl': '/out/' + 'normals-'+sceneName + '.bmp',
                'console': log
            });

        });

    });

});

// Start server
var server = app.listen(4000, function() {

    var host = server.address().address
    var port = server.address().port

    console.log('Example app listening at http://%s:%s', host, port)

});
