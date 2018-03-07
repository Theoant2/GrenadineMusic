var Musique = require('./Musique.js')
const YoutubeStream = require('ytdl-core')
const YoutubeSearch = require('youtube-search');
var ypi = require('youtube-playlist-info')
var main = require('./app.js')
var global_connection = null
var musiques = []
var urls = []
let opts = {
  maxResults: 1,
  key: 'AIzaSyBipzSu-IGET5OesgzOKALYUH5RHJqSvE0'
}
function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
function shiftArray(array){
  array.shift()
}
function MusiqueManager(Discord) {
    this.discord = Discord
    console.log("Musiques: ", this.musiques)
    console.log("Urls: ", this.urls)
}
refreshMusique = function() {
  if(musiques.length == 1){
    musiques[0].play(global_connection)
    this.reloadMusique()
  }
}
reloadMusique = function(){
  //console.log(musiques)
  musiques[0].getBuffer().on('end', function () {
    musiques.shift()
    urls.shift()
    if(musiques.length == 0){
      global_connection.disconnect()
    } else {
      musiques[0].play(global_connection)
      reloadMusique()
    }
  })
}
MusiqueManager.prototype.skip = function(){
  if(musiques.length > 0){
    musiques[0].getBuffer().end()
  } else {
    global_connection.disconnect()
    global_connection = null
  }
}
MusiqueManager.prototype.log = function(){
  /*console.log("Musiques3: ", musiques)
  console.log("Urls3: ", urls)
  console.log("Connection3: ", this.connection)*/
}
MusiqueManager.prototype.getMusiques = function(){
  return musiques
}
MusiqueManager.prototype.getLastMusique = function(){
  return musiques[0]
}
MusiqueManager.prototype.getUrls = function(){
  return musiques
}
MusiqueManager.prototype.getLastUrl = function(){
  return urls[0]
}
MusiqueManager.prototype.getConnection = function(){
  return global_connection
}
MusiqueManager.prototype.setConnection = function(connection){
  this.connection = connection
}
MusiqueManager.prototype.ajouterMusique = function(musique){
  musiques.push(musique)
  refreshMusique()
}
function ajouterMusique(musique){
  musiques.push(musique)
  refreshMusique()
}
MusiqueManager.prototype.retirerMusique = function(musique){
  for(let i in musiques){
    if(musiques[i] == musique){
      delete musiques[i]
    }
  }
}
MusiqueManager.prototype.ajouterMusiqueOptions = function(options, message, serveur){
  YoutubeSearch(options, opts, function(err, results) {
    if(err){
      console.log(err)
      message.reply("Une erreur est survenue")
      return
    }
    ajouterMusique(new Musique(results[0].id, message, global_connection, serveur))
    let embed = new this.discord.RichEmbed().
    setTitle("Informations sur la musique en cours")
    .setAuthor(results[0].channelTitle)
    .setColor(0xf3ee27)
    .setDescription("Titre: " + results[0].title)
    embed.setThumbnail(url=results[0].thumbnails.default.url)
    message.channel.send({embed})
  })
}
MusiqueManager.prototype.ajouterMusiquePlaylist = function(playlist_id, message, serveur){
  ypi.playlistInfo("AIzaSyBipzSu-IGET5OesgzOKALYUH5RHJqSvE0", playlist_id, function(playlistItems) {
    console.log(playlistItems.length)
    for(let i in playlistItems){
      ajouterMusique(new Musique(playlistItems[i].resourceId.videoId, message, global_connection, serveur))
    }
    message.reply("```" +
                  "Une playlist a été détécté ! \n" +
                  "Taille: " + playlistItems.length + "\n"
                  + "```")
    refreshMusique()
  })
}
MusiqueManager.prototype.ajouterMusiqueLink = function(url, message, serveur){
  YoutubeStream.getInfo(url, (err, info) => {
    if(err){
      console.log("UNE ERREUR EST SURVENUUEUEUEUEUEUE")
    } else {
        let embed = new this.discord.RichEmbed().
        setTitle("Informations sur la musique ajoutée")
        .setAuthor(info.author.name)
        .setColor(0xf3ee27)
        .setDescription("Titre: " + info.title + "\n" +
        "Durée: " + info.length_seconds.toString().toHHMMSS() +  "\n" +
        "Nombre de vues: " + info.short_view_count_text + "\n")
        embed.setThumbnail(url=info.iurlmq)
        message.channel.send({embed})
    }
  })
  this.ajouterMusique(new Musique(url, message, global_connection, serveur))

}
MusiqueManager.prototype.ajouterUrl = function(url, message, serveur){
  urls.push(url)
  this.ajouterMusique(new Musique(url, message, this.connection, serveur))
}
MusiqueManager.prototype.retierUrl = function(url){
  for(let i in urls){
    if(urls[i] == musique){
      delete urls[i]
    }
  }
}
MusiqueManager.prototype.rejoindre = function(channel, send){
  channel
    .join()
    .then(function (connection) {
      global_connection = connection
      //console.log("This.Connection: ", this.connection)
      //console.log("Connection: ", connection)
      send()
    })
}
module.exports = MusiqueManager
