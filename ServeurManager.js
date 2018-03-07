function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
function ServeurManager() {
    this.serveurs = []
}

ServeurManager.prototype.ajouterServeur = function(serveur){
  this.serveurs.push(serveur)
}
ServeurManager.prototype.retirerServeur = function(data){
  if(data.nom != undefined){
    for(let i in this.serveurs){
      if(this.serveurs[i].getName() == data.nom){
        delete this.serveurs[i]
      }
    }
  } else if(data.serveur != undefined){
    for(let i in this.serveurs){
      if(this.serveurs[i] == data.serveur){
        delete this.serveurs[i]
      }
    }
  } else if(data.id != undefined){
    for(let i in this.serveurs){
      if(this.serveurs[i].getId() == data.id){
        delete this.serveurs[i]
      }
    }
  }
}
ServeurManager.prototype.getServeur = function(data){
  if(data.nom != undefined){
    for(let i in this.serveurs){
      if(this.serveurs[i].getNom() == data.nom){
        return this.serveurs[i]
      }
    }
  } else if(data.serveur != undefined){
    for(let i in this.serveurs){
      if(this.serveurs[i] == data.serveur){
        return this.serveurs[i]
      }
    }
  } else if(data.id != undefined){
    for(let i in this.serveurs){
      if(this.serveurs[i].getId() == data.id){
        return this.serveurs[i]
      }
    }
  }
}

module.exports = ServeurManager
