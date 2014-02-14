var request = require('request'),
    fs = require('fs'),
    app = require('express')(),
 Sequelize = require('sequelize');


// Load config defaults from JSON file.
// Environment variables override defaults.
function loadConfig() {
    var config = JSON.parse(fs.readFileSync(__dirname + '/config.json', 'utf-8'));
    for (var i in config) {
        config[i] = process.env[i.toUpperCase()] || config[i];
    }
    console.log('Configuration');
    console.log(config);
    return config;
}

var config = loadConfig();


var sequelize = new Sequelize(config.dbname, config.dbuser, config.dbpass, {
    dialect: "mysql", // or 'sqlite', 'postgres', 'mariadb'
    port:    3306 // or 5432 (for postgres)
});

sequelize
    .authenticate()
    .complete(function(err) {
        if (!!err) {
            console.log('Unable to connect to the database:', err)
        } else {
            console.log('Connection has been established successfully.')
        }
    })

var Meme = sequelize.define('Meme', {
    title: Sequelize.STRING,
    imgur_user: Sequelize.STRING,
    subtype: Sequelize.STRING,
    link: Sequelize.STRING
})

/*sequelize
    .sync({ force: true })
    .complete(function(err) {
        if (!!err) {
            console.log('An error occurred while create the table:', err)
        } else {
            console.log('It worked!')
        }
    })*/



// Convenience for allowing CORS on routes - GET only
app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});


app.get('/memes', function (req, res) {
    console.log('get memes' + req.params);
    var options = {
        url: "https://api.imgur.com/3/gallery/g/memes/",
        headers: {
            'Authorization': 'Client-ID ' + config.imgur_clientId
        }
    };

    request.get(options, function(error, response, body){

        var body = JSON.parse(body);
        for(var i = 0; i< body.data.length; i++){
            //console.log(body.data[i]);

            Meme
                .create({
                    title: body.data[i].title,
                    imgur_user: body.data[i].account_url,
                    subtype: body.data[i].subtype,
                    link: body.data[i].link
                })
                .complete(function(err, user) {

                })
        }

    }).pipe(res);



});


var port = process.env.PORT || config.port || 9999;

app.listen(port, null, function (err) {
    console.log('imgurScraper, at your service: http://localhost:' + port);
});
