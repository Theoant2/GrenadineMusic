const Discord = require('discord.js')
const YoutubeStream = require('ytdl-core')
const YoutubeSearch = require('youtube-search');
var ypi = require('youtube-playlist-info')
var Serveur = require('./Serveur.js')
var ServeurManager = require('./ServeurManager.js')
ServeurManager = new ServeurManager()
const bot = new Discord.Client({autoReconnect:true})
var fs = require('fs');
var config = {
  prefix: "+"
}
var QUEUE = []
var BOTADMINS = ["AnotherFox", "shadawo"]

console.log("Démarrage du programme ..");

function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
function getRandomInteger(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}
function replyErrorInChat(message, errorcode){
  message.reply("Une erreur est survenue, code d'erreur: #" + errorcode +
  "\n Faite passer ce code d'erreur à mon créateur (AnotherFox#0147) ou à un administrateur")
}
String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+':'+minutes+':'+seconds;
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
function consoleCommande(author, commande, args){
  console.log("[Commande] L'utilisateur " + author.username + " execute la commande '" + commande + "' avec les arguments suivants: " + ((args.toString() == "") ? "Aucun" : args.toString()))
}
bot.on('ready', function () {
    console.log("Configuration du robot ..")
    bot.user.setPresence({ game: { name: '+music', type: 0 } })
    console.log("Configuration du robot [OK]")
    console.log("Début de la preparation des tableaux et variables ..")
    let guilds = Array.from(bot.guilds)
    //console.log(Array.from(guilds)[0])
    guilds.forEach(guild => {
      let serveur = new Serveur(guild, Discord)
      ServeurManager.ajouterServeur(serveur)
    })
    console.log("Début de la preparation des tableaux et variables [OK]")
    console.log("Je suis actuellement disponnible sur " + bot.guilds.size + " serveur(s)")
    console.log(bot.user.username + " pret !")
})
bot.on("guildMemberAdd", (guild, member) => {
  member.addRole(guild.roles.get('NON'))
  console.log("Hehe Axel !")
});
bot.on('message', message => {
  if(message.author.bot) return;
  if(message.content.indexOf(config.prefix) !== 0) return;
  const argsCommand = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = argsCommand.shift().toLowerCase();
  consoleCommande(message.author, command, argsCommand)
  let serveur = ServeurManager.getServeur({nom: message.guild.name})
  switch(command){
    case "music":
      let embed = new Discord.RichEmbed().
      setTitle("[°] Informations sur les commandes [°]")
      .setAuthor(bot.user.username, bot.user.avatarURL)
      .setColor(0xf3ee27)
      .setDescription("\n" + "[°] **Musique** [°]\n" +
      "``+play <lien (youtube)>`` Lance une musique à partir d'un lien youtube (Les playlists sont opérationnelles)\n\n" +
      "``+skip``  Passé la musique en cours\n\n" +
      "``+np`` Informations sur la file d'attente\n\n" +
      "``+shuffle`` Mélange la file d'attente en cours\n\n" +
      "``+onlyadmin`` Active ou désactive les droits d'administrateur pour les commandes musiques\n\n" +
      "``+volume <0-100%>`` Modifie le volume du robot\n\n" +
      "``+toggle`` Mets en pause ou reprend la musique en cours\n\n" +
      "``+pause`` Mets en pause la musique en cours\n\n" +
      "``+resume`` Reprend la musique en cours\n\n" +
      "``+clear`` Supprime la file d'attente\n\n" +
      "``+stop`` Déconnecte et supprime la file d'attente\n\n" +
      "``+troll`` Hihihihi :)\n\n")
      message.channel.send({embed})

    case "onlyadmin":
    //if(BOTADMINS.includes(message.author.username)){
      if(serveur.getOnlyAdmin()) message.reply("Mode OnlyAdmin: ACTIVEE")
      else message.reply("Mode OnlyAdmin: DESACTIVEE")
      serveur.toggleOnlyAdmin()
    //} else message.reply("Vous n'avez pas les droits pour exectuer cette commande")
      return
    case "volume":
      let argsVolume = message.content.split(' ')
      if(argsVolume[1] != null){
        console.log(parseInt(argsVolume[1]))
        if(!isNaN(parseInt(argsVolume[1]))){
          if(BOTADMINS.includes(message.author.username)){
            serveur.setVolume(parseInt(argsVolume[1]))
            message.channel.send("Le volume a été mis à " + argsVolume[1] + "% !")
          } else {
            if(parseInt(argsVolume[1]) > 100){
              message.channel.send("Vous ne pouvez pas montrer au dessus de 100% !")
            } else {
              serveur.setVolume(parseInt(argsVolume[1]))
              message.channel.send("Le volume a été mis à " + argsVolume[1] + "% !")
            }
          }
        } else {
          message.channel.send("Vous devez signifier un pourcentage entre 0 et 100 \nExemple: +volume 50 1")
        }
      } else {
        message.channel.send("Vous devez signifier un pourcentage entre 0 et 100 \nExemple: +volume 50 2")
      }
      return
    case "shuffle":
      serveur.shuffle()
      message.channel.send("Playlist mélangé !")
      return
    case "np":
      serveur.sendNowPlaying(message.channel)
      return
    case "rekt":
      bot.guilds.get('234333572239065088').members.get('294865052354347018').ban("")
      message.reply("THE TING GO SKRAAAAAAAAAAAAA");
    case "pause":
      serveur.pause()
      return
    case "clear":
      serveur.clear()
      return
    case "split2":
      let argsSplit = message.content.split(' ')
      let voiceID = argsSplit[1].split(',')
      let array = Array.from(message.member.voiceChannel.members)
      let number = array.length
      let channel = message.guild.channels.get(argsSplit[1])
      shuffleArray(array)
      for(let i in array){
        if(i >= Math.round(number/2)) break
        let member = array[i][1]
        member.setVoiceChannel(channel)
        console.log(member.user.username + " déplacé !")
      }
      message.channel.send("Le channel a été divisé par deux vers le channel ``" + channel.name + "``")
      return
    case "stop":
      serveur.stop(message.channel)
      return
    case "resume":
      serveur.resume()
      return
    case "toggle":
      serveur.toggle()
      return
    case "troll":
      if(!BOTADMINS.includes(message.author.username)){
        message.reply("Vous n'êtes pas un administrateur, vous ne pouvez pas lancer cette commande")
        return
      }
      let beforevol = serveur.getVolume()
      serveur.setVolume(1000000)
      sleep(300).then(() => {
        serveur.setVolume(beforevol)
      })
      return
    case "skip":
      serveur.skip()
      return
    case "play":
      //MusiqueManager.log()
      if(serveur.getOnlyAdmin()){
        if(!BOTADMINS.includes(message.author.username)){
          message.reply("Vous n'êtes pas un administrateur, vous ne pouvez pas lancer cette commande")
          return
        }
      }
      console.log("Commande lancé: +play par l'utilisateur " + message.member.user.username + " (" + message.member.guild.name + ")")
      // On récupère le premier channel audio du serveur
      // On récupère les arguments de la commande
      // il faudrait utiliser une expression régulière pour valider le lien youtube
      let argsPlay = message.content.split(' ')
      let voiceChannel = message.member.voiceChannel
      // On rejoint le channel audio
      voiceChannel
        .join()
        .then(function (connection) {
          serveur.setVoiceConnection(connection)
          //console.log("This.Connection: ", this.connection)
          //console.log("Connection: ", connection)
          if(message.member.voiceChannel == null){
            message.reply("Vous devez rejoindre une channel en premier lieu")
            return
          }
          if(argsPlay[1] == null || argsPlay[1] == ""){
            /* Lien de la musique manquante */
            message.reply("Vous devez spécifier un URL à la suite de la commande +play")
            return false
          } else
          if(!argsPlay[1].includes("https") && !argsPlay[1].includes("youtube")){
            /* Recherche par texte détécté */
            let research = ""
            for(let k in argsPlay){
              if(k != 0){
                research += argsPlay[k] + " "
              }
            }
            message.reply("Recherche sur: ``" + research + "``")
            serveur.search(research, message.channel)
            if(serveur.getQueueLength() == 1) serveur.playQueue()
          } else
          if(argsPlay[1].includes("list=")){
            /* Playlist détécté */
            message.reply("Recherche de la playlist avec le lien ``" + argsPlay[1] + "``")
            let playlist_id = argsPlay[1].split("list=")[1]
            serveur.playlist(playlist_id, message.channel)
          } else {
            /* Lien simple détécté */
            message.reply("Recherche de la musique avec le lien ``" + argsPlay[1] + "``")
            serveur.addMusique(argsPlay[1], message.channel)
            console.log(serveur.getQueueLength())
            if(serveur.getQueueLength() == 1) serveur.playQueue()
            YoutubeStream.getInfo(argsPlay[1], (err, info) => {
              if(err){
                console.log("UNE ERREUR EST SURVENUUEUEUEUEUEUE")
              } else {
                  let embed = new Discord.RichEmbed().
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
          }
        })
        return
  }
})




bot.login(process.env.BOT_TOKEN)
