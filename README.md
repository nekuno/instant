# Nekuno Instant 0.11.2 #
-------------------------

## Requisites ##
* nodejs
* npm

## Installation ##
* Install dependencies.
```
npm install
```
* Copy src/config/params.yml.dist to src/config/params.yml. If you run directly the server, you will be asked to make a copy for you.
* Add information for the mysql connection on src/config/params.yml.
* Execute the server.
```
node src/app.js
```

## Tests ##
To run the tests run with `gulp`

## Example ##
You can find a client example in /doc/example-chat-client.php