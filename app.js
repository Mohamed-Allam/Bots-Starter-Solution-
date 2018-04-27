require('dotenv-extended').load();
const restify = require('restify');
const bot = require('./bot.js');
var serveStatic = require('serve-static-restify')

const server = restify.createServer();
server.post('/api/messages', bot.connector('*').listen());

server.get("/", restify.plugins.serveStatic({

    directory:"public",

    default: 'index.html'

  }));

  server.get(
    /\/(.*)?.*/,
    restify.plugins.serveStatic({
      directory: './css',
    })
  )

//   server.get("/", function(req,res){

// res.send(" Hi There");
//   });
  

server.listen(process.env.PORT || 3978, () => {
    console.log(`${server.name} listening to ${server.url}`);
});
