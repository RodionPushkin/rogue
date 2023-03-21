function Game() {
  this.game_settings = {
    // max-health - максимальное здоровье, damage - наносимый урон
    // почему игрок называется client? потому что вдруг в перспективе нужно будет прикрутить онлайн
    _client_damage: 10,
    _client_max_health: 100,
    _bot_damage: 10,
    _bot_max_health: 100,
    _potion_count: 10,
    _potion_health: 10,
    _weapon_count: 2,
    _weapon_damage: 10,
  };
  this.game_info = {
    map: [], field: {
      el: document.querySelector('.field'), settings: {}
    }, status: -1, // 1 - игра идет, 0 - игра приостановлена, -1 игра не началась
    player: null, bots: [], clients: [], potions: [], weapons: []
  };
}

Game.prototype.init = function () {
  console.log("Game initiated");
  console.log(this);
  document.addEventListener('keyup', (event) => {
    if (event.keyCode == 27 && this.game_info.status != -1) {
      if (this.game_info.status == 0) this.continue(); else if (this.game_info.status == 1) this.pause();
    }
    if (this.game_info.player && this.game_info.status == 1) {
      if (event.keyCode == 87) {
        this.game_info.player.move("top")
      }
      if (event.keyCode == 65) {
        this.game_info.player.move("left")
      }
      if (event.keyCode == 83) {
        this.game_info.player.move("bottom")
      }
      if (event.keyCode == 68) {
        this.game_info.player.move("right")
      }
      if (event.keyCode == 32) {
        this.game_info.player.attack()
      }
    }
  })
  window.addEventListener("resize", () => {
    if (game.game_info.status != -1) {
      this.clearMap()
      this.generateMap()
      this.renderMap()
    }
  })
  document.querySelector('.pause-overlay').addEventListener("click", () => {
    game.continue()
  })
  document.querySelector('.start-overlay').addEventListener("click", () => {
    game.start()
  })
}
Game.prototype.pause = function () {
  console.log("Game paused");
  this.game_info.status = 0;
  this.game_info.field.el.classList.remove('start')
  this.game_info.field.el.classList.toggle('pause', true)
}
Game.prototype.start = function () {
  console.log("Game started");
  this.game_info.status = 1;
  this.game_info.field.el.classList.remove('start', 'pause')
  game.generateMap()
  this.renderMap()
}
Game.prototype.continue = function () {
  console.log("Game continue");
  this.game_info.status = 1;
  this.game_info.field.el.classList.remove('start', 'pause')
}
Game.prototype.end = function () {
  console.log("Game end");
  this.game_info.status = -1;
  clearInterval(game.game_info.interval)
  clearInterval(game.game_info.bot_damage_interval)
  this.game_info.map = []
  game.game_info.bots = []
  game.game_info.clients = []
  game.game_info.potions = []
  game.game_info.weapons = []
  this.game_info.field.el.classList.remove('pause')
  this.game_info.field.el.classList.toggle('start', true)
  game.clearMap()
}
Game.prototype.generateMap = function () {
  console.log("Game generate map");
  clearInterval(game.game_info.interval)
  clearInterval(game.game_info.bot_damage_interval)
  this.game_info.map = []
  game.game_info.bots = []
  game.game_info.clients = []
  game.game_info.potions = []
  game.game_info.weapons = []
  this.game_info.field.settings.x = this.game_info.field.el.clientWidth;
  this.game_info.field.settings.y = this.game_info.field.el.clientHeight;
  this.game_info.field.settings.tile = 50;
  let index = 0
  for (let i = 0; i < Math.floor(this.game_info.field.settings.x / this.game_info.field.settings.tile); i++) {
    let row = [];
    for (let j = 0; j < Math.floor(this.game_info.field.settings.y / this.game_info.field.settings.tile); j++) {
      row.push({
        class: "tileW", index: index
      })
      index++
    }
    this.game_info.map.push(row)
  }
  // horizontal lines
  for (let i = 0; i < Math.floor(Math.random() * 2 + 3); i++) {
    let line = Math.floor(Math.random() * this.game_info.map[0].length)
    for (let i = 0; i < this.game_info.map.length; i++) {
      for (let j = 0; j < this.game_info.map[i].length; j++) {
        this.game_info.map[i][line].class = "tile"
      }
    }
  }
  // vertical lines
  for (let i = 0; i < Math.floor(Math.random() * 2 + 3); i++) {
    let line = Math.floor(Math.random() * this.game_info.map.length)
    for (let i = 0; i < this.game_info.map.length; i++) {
      for (let j = 0; j < this.game_info.map[i].length; j++) {
        this.game_info.map[line][j].class = "tile"
      }
    }
  }
  // room
  for (let i = 0; i < Math.floor(Math.random() * 5 + 5); i++) {
    const x = Math.floor(Math.random() * this.game_info.map[0].length),
      y = Math.floor(Math.random() * this.game_info.map.length),
      xMax = x + Math.floor(Math.random() * 5 + 3),
      yMax = y + Math.floor(Math.random() * 5 + 3)

    for (let j = 0; j < this.game_info.map.length; j++) {
      for (let k = 0; k < this.game_info.map[j].length; k++) {
        if ((k > x && k < xMax) || (j > y && j < yMax)) {
          this.game_info.map[j][k].class = "tile"
        }
      }
    }
  }
  // potions
  for (let i = 0; i < game.game_settings._potion_count; i++) {
    const potion = new Potion("Зелье лечения", game.game_settings._potion_health)
    potion.spawn()
    game.game_info.potions.push(potion)
  }
  // weapons
  for (let i = 0; i < game.game_settings._weapon_count; i++) {
    const weapon = new Weapon("Меч", game.game_settings._weapon_damage, game.game_settings._weapon_attack_delay)
    weapon.spawn()
    game.game_info.weapons.push(weapon)
  }
  // bot
  for (let i = 0; i < 10; i++) {
    const bot = new Bot()
    bot.create()
    bot.spawn()
  }
  game.game_info.player = new Client()
  game.game_info.player.create()
  game.game_info.player.spawn()
  game.game_info.interval = setInterval(function () {
    for (let i = 0; i < game.game_info.bots.length; i++) {
      const rnd = Math.floor(Math.random() * 100)
      if (rnd < 25) game.game_info.bots[i].move("top");
      else if (rnd >= 25 && rnd < 50) game.game_info.bots[i].move("left");
      else if (rnd >= 50 && rnd < 75) game.game_info.bots[i].move("bottom");
      else if (rnd >= 75) game.game_info.bots[i].move("right");
    }
  }, 800)
  game.game_info.bot_damage_interval = setInterval(function () {
    for (let i = 0; i < game.game_info.bots.length; i++) {
      game.game_info.bots[i].attack()
    }
  }, 500)
}
Game.prototype.clearMap = function () {
  this.game_info.field.el.innerHTML = ""
}
Game.prototype.renderMap = function () {
  game.clearMap()
  if (game.game_info.bots.length == 0 || game.game_info.player.health <= 0) {
    game.end()
    return
  }
  for (let i = 0; i < this.game_info.map.length; i++) {
    for (let j = 0; j < this.game_info.map[i].length; j++) {
      const tile = document.createElement("div")
      tile.classList.add('tile', this.game_info.map[i][j].class)
      tile.style.top = `${(j) * 50}px`
      tile.style.left = `${(i) * 50}px`
      if (this.game_info.map[i][j].innerEl) this.game_info.field.el.appendChild(tile).appendChild(this.game_info.map[i][j].innerEl); else this.game_info.field.el.appendChild(tile)
    }
  }
}

/**
 * Client class.
 *
 * @constructor
 * @param {Number} health - здоровье
 * @param {Number} damage  - наносимый урон
 */
function Client(health = game.game_settings._client_max_health, damage = game.game_settings._client_damage) {
  this.health = health;
  this.damage = damage;
}

Client.prototype.create = function () {
  console.log("Client created")
  game.game_info.clients.push(this)
}
Client.prototype.spawn = function () {
  console.log("Client spawned")
  let emptyTiles = []
  game.game_info.map.map(row => {
    emptyTiles.push(...row.filter(tile => tile.class == "tile"))
  })
  const chosenTile = emptyTiles[Math.floor(Math.random() * emptyTiles.length)]
  game.game_info.map.map(row => {
    if (row.find(tile => tile.index == chosenTile.index)) {
      row = row.map(tile => {
        if (tile.index == chosenTile.index) {
          tile.class = "tileP"
          let health = document.createElement("div")
          health.classList.add("health")
          health.style.width = `${40 / game.game_settings._client_max_health * this.health}px`
          tile.innerEl = health
        }
        return tile
      })
    }
    return row
  })
}
Client.prototype.attack = function () {
  console.log("Client attack")
  let clientX = 0, clientY = 0;
  for (let i = 0; i < game.game_info.map.length; i++) {
    for (let j = 0; j < game.game_info.map[i].length; j++) {
      if (game.game_info.map[i][j].class == "tileP") {
        clientX = j
        clientY = i
      }
    }
  }
  const damageBox = [
    // {
    //   x: clientX+1,
    //   y: clientY-1,
    // },
    {
      x: clientX + 1,
      y: clientY,
    },
    // {
    //   x: clientX+1,
    //   y: clientY+1,
    // },
    {
      x: clientX,
      y: clientY - 1,
    },
    {
      x: clientX,
      y: clientY + 1,
    },
    // {
    //   x: clientX-1,
    //   y: clientY-1,
    // },
    {
      x: clientX - 1,
      y: clientY,
    },
    // {
    //   x: clientX-1,
    //   y: clientY+1,
    // }
  ]
  for (let i = 0; i < game.game_info.map.length; i++) {
    for (let j = 0; j < game.game_info.map[i].length; j++) {
      if (damageBox.find(box => box.x == j && box.y == i) && game.game_info.bots.find(bot => bot.index == game.game_info.map[i][j].index)) {
        for (let k = 0; k < game.game_info.bots.length; k++) {
          if (game.game_info.bots[k].index == game.game_info.map[i][j].index) {
            game.game_info.bots[k].health -= game.game_info.player.damage
            game.game_info.map[i][j].innerEl.style.width = `${40 / game.game_settings._bot_max_health * game.game_info.bots[k].health}px`
            if (game.game_info.bots[k].health <= 0) {
              game.game_info.bots.splice(k, 1)
              game.game_info.map[i][j].class = "tile"
              game.game_info.map[i][j].innerEl = null
            }
          }
        }
      }
    }
  }
  game.renderMap()
}
Client.prototype.move = function (type = "top") {
  let clientX = 0, clientY = 0;
  for (let i = 0; i < game.game_info.map.length; i++) {
    for (let j = 0; j < game.game_info.map[i].length; j++) {
      if (game.game_info.map[i][j].class == "tileP") {
        clientX = j
        clientY = i
      }
    }
  }
  switch (type) {
    case "top": {
      if (game.game_info.map[clientY][clientX - 1] && (game.game_info.map[clientY][clientX - 1].class == "tile" || game.game_info.map[clientY][clientX - 1].class == "tileHP" || game.game_info.map[clientY][clientX - 1].class == "tileSW")) {
        if (game.game_info.map[clientY][clientX - 1].class == "tileHP") game.game_info.player.health = game.game_info.player.health + game.game_settings._potion_health > game.game_settings._client_max_health ? game.game_settings._client_max_health : game.game_info.player.health + game.game_settings._potion_health; else if (game.game_info.map[clientY][clientX - 1].class == "tileSW") game.game_info.player.damage = game.game_info.player.damage + game.game_settings._weapon_damage
        game.game_info.map[clientY][clientX - 1].class = "tileP"
        game.game_info.map[clientY][clientX].innerEl.style.width = `${40 / game.game_settings._client_max_health * game.game_info.player.health}px`
        game.game_info.map[clientY][clientX - 1].innerEl = game.game_info.map[clientY][clientX].innerEl
        game.game_info.map[clientY][clientX].class = "tile"
        game.game_info.map[clientY][clientX].innerEl = undefined
        game.renderMap()
        console.log("Client move", type)
      }
      break;
    }
    case "right": {
      if (game.game_info.map[clientY + 1] && (game.game_info.map[clientY + 1][clientX].class == "tile" || game.game_info.map[clientY + 1][clientX].class == "tileHP" || game.game_info.map[clientY + 1][clientX].class == "tileSW")) {
        if (game.game_info.map[clientY + 1][clientX].class == "tileHP") game.game_info.player.health = game.game_info.player.health + game.game_settings._potion_health > game.game_settings._client_max_health ? game.game_settings._client_max_health : game.game_info.player.health + game.game_settings._potion_health; else if (game.game_info.map[clientY + 1][clientX].class == "tileSW") game.game_info.player.damage = game.game_info.player.damage + game.game_settings._weapon_damage
        game.game_info.map[clientY + 1][clientX].class = "tileP"
        game.game_info.map[clientY][clientX].class = "tile"
        game.game_info.map[clientY][clientX].innerEl.style.width = `${40 / game.game_settings._client_max_health * game.game_info.player.health}px`
        game.game_info.map[clientY + 1][clientX].innerEl = game.game_info.map[clientY][clientX].innerEl
        game.game_info.map[clientY][clientX].innerEl = undefined
        game.renderMap()
        console.log("Client move", type)
      }
      break;
    }
    case "bottom": {
      if (game.game_info.map[clientY][clientX + 1] && (game.game_info.map[clientY][clientX + 1].class == "tile" || game.game_info.map[clientY][clientX + 1].class == "tileHP" || game.game_info.map[clientY][clientX + 1].class == "tileSW")) {
        if (game.game_info.map[clientY][clientX + 1].class == "tileHP") game.game_info.player.health = game.game_info.player.health + game.game_settings._potion_health > game.game_settings._client_max_health ? game.game_settings._client_max_health : game.game_info.player.health + game.game_settings._potion_health; else if (game.game_info.map[clientY][clientX + 1].class == "tileSW") game.game_info.player.damage = game.game_info.player.damage + game.game_settings._weapon_damage
        game.game_info.map[clientY][clientX + 1].class = "tileP"
        game.game_info.map[clientY][clientX].class = "tile"
        game.game_info.map[clientY][clientX].innerEl.style.width = `${40 / game.game_settings._client_max_health * game.game_info.player.health}px`
        game.game_info.map[clientY][clientX + 1].innerEl = game.game_info.map[clientY][clientX].innerEl
        game.game_info.map[clientY][clientX].innerEl = undefined
        game.renderMap()
        console.log("Client move", type)
      }
      break;
    }
    case "left": {
      if (game.game_info.map[clientY - 1] && (game.game_info.map[clientY - 1][clientX].class == "tile" || game.game_info.map[clientY - 1][clientX].class == "tileHP" || game.game_info.map[clientY - 1][clientX].class == "tileSW")) {
        if (game.game_info.map[clientY - 1][clientX].class == "tileHP") game.game_info.player.health = game.game_info.player.health + game.game_settings._potion_health > game.game_settings._client_max_health ? game.game_settings._client_max_health : game.game_info.player.health + game.game_settings._potion_health; else if (game.game_info.map[clientY - 1][clientX].class == "tileSW") game.game_info.player.damage = game.game_info.player.damage + game.game_settings._weapon_damage
        game.game_info.map[clientY - 1][clientX].class = "tileP"
        game.game_info.map[clientY][clientX].class = "tile"
        game.game_info.map[clientY][clientX].innerEl.style.width = `${40 / game.game_settings._client_max_health * game.game_info.player.health}px`
        game.game_info.map[clientY - 1][clientX].innerEl = game.game_info.map[clientY][clientX].innerEl
        game.game_info.map[clientY][clientX].innerEl = undefined
        game.renderMap()
        console.log("Client move", type)
      }
      break;
    }
  }
  // game.game_info.map
}

/**
 * Bot class.
 *
 * @constructor
 * @param {Number} health - здоровье
 * @param {Number} damage  - наносимый урон
 */
function Bot(health = game.game_settings._bot_max_health, damage = game.game_settings._bot_damage) {
  this.health = health;
  this.damage = damage;
  this.index = null
}

Bot.prototype.create = function () {
  console.log("Bot created")
  game.game_info.bots.push(this)
}
Bot.prototype.attack = function () {
  let clientX = 0, clientY = 0;
  for (let i = 0; i < game.game_info.map.length; i++) {
    for (let j = 0; j < game.game_info.map[i].length; j++) {
      if (game.game_info.map[i][j].index == this.index) {
        clientX = j
        clientY = i
      }
    }
  }
  const damageBox = [
    {
      x: clientX + 1,
      y: clientY - 1,
    },
    {
      x: clientX + 1,
      y: clientY,
    },
    {
      x: clientX + 1,
      y: clientY + 1,
    },
    {
      x: clientX,
      y: clientY - 1,
    },
    {
      x: clientX,
      y: clientY + 1,
    },
    {
      x: clientX - 1,
      y: clientY - 1,
    },
    {
      x: clientX - 1,
      y: clientY,
    },
    {
      x: clientX - 1,
      y: clientY + 1,
    }
  ]
  for (let i = 0; i < game.game_info.map.length; i++) {
    for (let j = 0; j < game.game_info.map[i].length; j++) {
      if (damageBox.find(box => box.x == j && box.y == i) && game.game_info.map[i][j].class == "tileP") {
        console.log(game.game_info.player.health,this.damage)
        game.game_info.player.health -= this.damage
      }
    }
  }
  game.renderMap()
}
Bot.prototype.spawn = function () {
  console.log("Bot spawned")
  let emptyTiles = []
  game.game_info.map.map(row => {
    emptyTiles.push(...row.filter(tile => tile.class == "tile"))
  })
  const chosenTile = emptyTiles[Math.floor(Math.random() * emptyTiles.length)]
  game.game_info.map.map(row => {
    if (row.find(tile => tile.index == chosenTile.index)) {
      row = row.map(tile => {
        if (tile.index == chosenTile.index) {
          this.index = tile.index
          tile.class = "tileE"
          let health = document.createElement("div")
          health.classList.add("health")
          health.style.width = `${40 / game.game_settings._bot_max_health * this.health}px`
          tile.innerEl = health
        }
        return tile
      })
    }
    return row
  })
}
Bot.prototype.move = function (type = "top") {
  let clientX = 0, clientY = 0;
  for (let i = 0; i < game.game_info.map.length; i++) {
    for (let j = 0; j < game.game_info.map[i].length; j++) {
      if (game.game_info.map[i][j].index == this.index) {
        clientX = j
        clientY = i
      }
    }
  }
  switch (type) {
    case "top": {
      if (game.game_info.map[clientY][clientX - 1] && game.game_info.map[clientY][clientX - 1].class == "tile") {
        this.index = game.game_info.map[clientY][clientX - 1].index
        game.game_info.map[clientY][clientX - 1].class = "tileE"
        game.game_info.map[clientY][clientX - 1].innerEl = game.game_info.map[clientY][clientX].innerEl
        game.game_info.map[clientY][clientX].class = "tile"
        game.game_info.map[clientY][clientX].innerEl = undefined
        game.renderMap()
      }
      break;
    }
    case "right": {
      if (game.game_info.map[clientY + 1] && game.game_info.map[clientY + 1][clientX].class == "tile") {
        this.index = game.game_info.map[clientY + 1][clientX].index
        game.game_info.map[clientY + 1][clientX].class = "tileE"
        game.game_info.map[clientY][clientX].class = "tile"
        game.game_info.map[clientY + 1][clientX].innerEl = game.game_info.map[clientY][clientX].innerEl
        game.game_info.map[clientY][clientX].innerEl = undefined
        game.renderMap()
      }
      break;
    }
    case "bottom": {
      if (game.game_info.map[clientY][clientX + 1] && game.game_info.map[clientY][clientX + 1].class == "tile") {
        this.index = game.game_info.map[clientY][clientX + 1].index
        game.game_info.map[clientY][clientX + 1].class = "tileE"
        game.game_info.map[clientY][clientX].class = "tile"
        game.game_info.map[clientY][clientX + 1].innerEl = game.game_info.map[clientY][clientX].innerEl
        game.game_info.map[clientY][clientX].innerEl = undefined
        game.renderMap()
      }
      break;
    }
    case "left": {
      if (game.game_info.map[clientY - 1] && game.game_info.map[clientY - 1][clientX].class == "tile") {
        this.index = game.game_info.map[clientY - 1][clientX].index
        game.game_info.map[clientY - 1][clientX].class = "tileE"
        game.game_info.map[clientY][clientX].class = "tile"
        game.game_info.map[clientY - 1][clientX].innerEl = game.game_info.map[clientY][clientX].innerEl
        game.game_info.map[clientY][clientX].innerEl = undefined
        game.renderMap()
      }
      break;
    }
  }
}

/**
 * Weapon class.
 *
 * @constructor
 * @param {String} name - имя оружия
 * @param {Number} damage - урон оружия
 */
function Weapon(name, damage) {
  this.damage = damage;
}

Weapon.prototype.spawn = function () {
  let emptyTiles = []
  game.game_info.map.map(row => {
    emptyTiles.push(...row.filter(tile => tile.class == "tile"))
  })
  const chosenTile = emptyTiles[Math.floor(Math.random() * emptyTiles.length)]
  game.game_info.map.map(row => {
    if (row.find(tile => tile.index == chosenTile.index)) {
      row = row.map(tile => {
        if (tile.index == chosenTile.index) {
          tile.class = "tileSW"
        }
        return tile
      })
    }
    return row
  })
}

/**
 * Potion class.
 *
 * @constructo
 * @param {String} name - имя зелья
 * @param {Number} healing - лечение зелья
 */
function Potion(name, healing) {
  this.healing = healing;
}

Potion.prototype.spawn = function () {
  let emptyTiles = []
  game.game_info.map.map(row => {
    emptyTiles.push(...row.filter(tile => tile.class == "tile"))
  })
  const chosenTile = emptyTiles[Math.floor(Math.random() * emptyTiles.length)]
  game.game_info.map.map(row => {
    if (row.find(tile => tile.index == chosenTile.index)) {
      row = row.map(tile => {
        if (tile.index == chosenTile.index) {
          tile.class = "tileHP"
        }
        return tile
      })
    }
    return row
  })
}