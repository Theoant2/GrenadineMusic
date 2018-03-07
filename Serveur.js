const YoutubeStream = require('ytdl-core')
const YoutubeSearch = require('youtube-search');
var ypi = require('youtube-playlist-info')
var main = require('./app2.js')
var QUEUE = []
var lastChannel = null
var voiceConnection = null
var DISCORD = null
var buffer = null
var VOLUME = 0.5
let opts = {
  maxResults: 1,
  key: 'AIzaSyBipzSu-IGET5OesgzOKALYUH5RHJqSvE0'
}
function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
function shuffleArray(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
}
function Serveur(guild, discord) {
    this.discord = discord
    DISCORD = this.discord
    this.guild = guild[1]
    this.nom = this.guild.name
    this.id = this.guild.id
    this.members = this.guild.members
    this.onlyadmin = false
}

Serveur.prototype.setVoiceConnection = function(connection){
  this.voiceConnection = connection
  voiceConnection = connection
}
Serveur.prototype.getVoiceConnection = function(){
  return this.voiceConnection
}
sendEmbedMessage = function(author, url2, title, seconds, views, image){
  let embed = new DISCORD.RichEmbed().
  setTitle("Informations sur la musique")
  .setAuthor(author, url2)
  .setColor(0xf3ee27)
  .setDescription("Titre: " + title + "\n" +
  "Durée: " + seconds +  "\n" +
  "Nombre de vues: " + views + "\n")
  embed.setThumbnail(url=image)
  lastChannel.send({embed})
}
playQueue = function(){
  if(QUEUE.length != 0){
    buffer = voiceConnection.playStream(YoutubeStream(QUEUE[0].url))
    buffer.setVolume(VOLUME)
    console.log("lancement musique")
    buffer.on('end', function () {
      lastChannel = QUEUE[0].channel
      QUEUE.shift()
      console.log(QUEUE.length)
      if(QUEUE.length > 0){
        console.log(QUEUE.length)
        YoutubeStream.getInfo(QUEUE[0].url, (err, info) => {
          if(err){
            console.log("UNE ERREUR EST SURVENUUEUEUEUEUEUE")
          } else {
            sendEmbedMessage(info.author.name,QUEUE[0].url,info.title,info.length_seconds.toString().toHHMMSS(),info.short_view_count_text,info.iurlmq)
          }
        })
      } else {
        lastChannel.send("Il n'y a plus de musique dans la file d'attente")
      }
      playQueue()
    })
  } else {
      disconnectVoice()
  }
}
Serveur.prototype.playQueue = playQueue
addMusique = function(link, chl){
  QUEUE.push({url: link, channel: chl})
}
Serveur.prototype.addMusique = addMusique
Serveur.prototype.skip = function(){
  buffer.end()
}
disconnectVoice = function(){
  if(voiceConnection != null){
    voiceConnection.disconnect()
    voiceConnection = null
    lastChannel.send("Déconnection ..")
  } else lastChannel.send("Je ne peux pas me déconnecter car je ne suis pas connecté sur un channel vocal")
}
Serveur.prototype.disconnectVoice = disconnectVoice
Serveur.prototype.search = function(options, chl){
  YoutubeSearch(options, opts, function(err, results) {
    console.log(options)
    if(err){
      console.log(err)
      chl.send("Une erreur est survenue")
      return
    }
    addMusique("https://www.youtube.com/watch?v=" + results[0].id, chl)
    let embed = new this.discord.RichEmbed().
    setTitle("Informations sur la musique en cours")
    .setAuthor(results[0].channelTitle)
    .setColor(0xf3ee27)
    .setDescription("Titre: " + results[0].title)
    embed.setThumbnail(url=results[0].thumbnails.default.url)
    chl.send({embed})
  })
}
Serveur.prototype.playlist = function(playlist_id, chl){
  ypi.playlistInfo("AIzaSyBipzSu-IGET5OesgzOKALYUH5RHJqSvE0", playlist_id, function(playlistItems) {
    console.log(playlistItems.length)
    for(let i in playlistItems){
      addMusique("https://www.youtube.com/watch?v=" + playlistItems[i].resourceId.videoId, chl)
    }
    playQueue()
    chl.send("```" +
                  "Une playlist a été détécté ! \n" +
                  "Taille: " + playlistItems.length + "\n"
                  + "```")
  })
}
Serveur.prototype.sendNowPlaying = function(chl){
  let msg = ""
  for(let i in QUEUE){
    if(i > 5) break
    console.log("ZBEUB")
    YoutubeStream.getInfo(QUEUE[i].url, (err, info) => {
      if(err){
        msg += "Une erreur est survenue"
        console.log("test2")
      } else {
        console.log("yesy")
        msg += "Titre: " + info.title + "\n"
        msg += "Durée: " + info.length_seconds.toString().toHHMMSS() + "\n\n"
        if(i == 5 || i == (QUEUE.length-1)){
          console.log(QUEUE.length)
          if(msg == ""){
            chl.send('Aucune musique en cours')
          } else {
            let embed = new DISCORD.RichEmbed().
            setTitle("Informations sur la file d'attente")
            .setColor(0xf3ee27)
            .setDescription(msg)
            chl.send({embed})
          }
        }
      }
    })
  }
}
Serveur.prototype.setVolume = function(volume){
  VOLUME = volume/100
  if(buffer != null) buffer.setVolume(VOLUME)
}
Serveur.prototype.getVolume = function(){
  return VOLUME
}
Serveur.prototype.pause = function(){
  if(buffer != null){
    buffer.pause()
  }
}
Serveur.prototype.resume = function(){
  if(buffer != null){
    buffer.resume()
  }
}
Serveur.prototype.toggle = function(){
  if(buffer != null){
    if(buffer.paused)
        buffer.resume()
    else if(!buffer.paused)
        buffer.pause()
  }
}
Serveur.prototype.clear = function(){
  if(QUEUE.length > 0){
    let first = QUEUE[0]
    QUEUE = []
    QUEUE.push(first)
  } else {
    QUEUE = []
  }
}
Serveur.prototype.stop = function(chl){
  lastChannel = chl
  disconnectVoice()
  QUEUE = []
}
Serveur.prototype.getQueueLength = function(){
  return QUEUE.length
}
Serveur.prototype.shuffle = function(){
  shuffleArray(QUEUE)
}
Serveur.prototype.getGuild = function(){
  return this.guild
}
Serveur.prototype.getId = function(){
  return this.id
}
Serveur.prototype.getNom = function(){
  return this.nom
}
Serveur.prototype.getMembers = function(){
  return this.members
}
Serveur.prototype.getOnlyAdmin = function(){
  return this.onlyadmin
}
Serveur.prototype.toggleOnlyAdmin = function(){
  this.onlyadmin = -this.onlyadmin
}
module.exports = Serveur
