const YoutubeStream = require('ytdl-core')
const YoutubeSearch = require('youtube-search');
var ypi = require('youtube-playlist-info')
var main = require('./app.js')

function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
function Musique(url, message, connection, serveur) {
    this.serveur = serveur
    this.url = url
    this.connection = connection
    this.message = message
    this.buffer = null
    this.stream = null
}

Musique.prototype.getNom = function(){
  return this.nom
}
Musique.prototype.getserveur = function(){
  return this.serveur
}
Musique.prototype.getUrl = function(){
  return this.url
}
Musique.prototype.getStream = function(){
  return this.stream
}
Musique.prototype.setStream = function(stream){
  this.stream = stream
}
Musique.prototype.getConnection = function(){
  return this.connection
}
Musique.prototype.getBuffer = function(){
  return this.buffer
}
Musique.prototype.getMessage = function(){
  return this.message
}
Musique.prototype.toggleMusic = function(){
  if(this.stream.paused)
      this.stream.resume()
  else if(!this.stream.paused)
      this.stream.pause()
}
Musique.prototype.play = function(connection){
  console.log("Lecture de : " + this.url)
  this.stream = YoutubeStream(this.url)
  this.stream.on('error', function () {
    message.channel.send("Je n'ai pas réussi à lire cette vidéo :(")
    connection.disconnect()
    returned = true
  })
  this.connection = connection
  this.buffer = this.connection.playStream(this.stream)
}

module.exports = Musique
