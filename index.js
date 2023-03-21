function Game () {
  this.game_settings = {
    // delay - задержка между нанесением атаки, max-health - максимальное здоровье, damage - наносимый урон
    // почему игрок называется client? потому что вдруг в перспективе нужно будет прикрутить онлайн
    _client_damage: 10,
    _client_max_health: 100,
    _client_attack_delay: 0.1,
    _bot_damage: 10,
    _bot_max_health: 100,
    _bot_attack_delay: 0.2
  };
  this.game_info = {
    map: [],
    status: -1, // 1 - игра идет, 0 - игра приостановлена, -1 игра не началась
    bots: [],
    clients: [],
    props: []
  };
}
Game.prototype.init = function (){
  console.log("Game initiated");
  console.log(this);
  document.addEventListener('keyup',(event)=>{
    // console.log(event)
    if(event.keyCode == 27){
      if(this.game_info.status == 0) this.continue();
      else if(this.game_info.status == 1) this.pause();
    }
  })
}
Game.prototype.pause = function (){
  console.log("Game paused");
  this.game_info.status = 0;
}
Game.prototype.continue = function (){
  console.log("Game continue");
  this.game_info.status = 1;
}
/**
 * Client class.
 *
 * @constructor
 * @param {Number} health - здоровье
 * @param {Number} damage  - наносимый урон
 * @param {Number} attack_delay  - задержка атаки
 */
function Client (
  health = game.game_settings._client_max_health,
  damage = game.game_settings._client_damage,
  attack_delay = game.game_settings._client_attack_delay
){
  this.health = health;
  this.damage = damage;
  this.attack_delay = attack_delay;
}
Client.prototype.create = function (){
}
Client.prototype.spawn = function (){
}
/**
 * Bot class.
 *
 * @constructor
 * @param {Number} health - здоровье
 * @param {Number} damage  - наносимый урон
 * @param {Number} attack_delay  - задержка атаки
 */
function Bot (
  health = game.game_settings._bot_max_health,
  damage = game.game_settings._bot_damage,
  attack_delay = game.game_settings._bot_attack_delay
){
  this.health = health;
  this.damage = damage;
  this.attack_delay = attack_delay;
}
Bot.prototype.create = function (){
}
Bot.prototype.spawn = function (){
}
/**
 * Prop class.
 *
 * @constructor
 * @param {String} name - имя предмета
 */
function Prop (name){
  this.name = name;
}
Prop.prototype.create = function (){
}
Prop.prototype.spawn = function (){
}
/**
 * Weapon class.
 *
 * @constructor
 * @param {Class} parent - родитель оружия
 * @param {String} name - имя оружия
 * @param {Number} damage - урон оружия
 * @param {Number} attack_delay - задержка атаки оружия
 */
function Weapon (parent,name,damage, attack_delay){
  Prop.call(this, name);
  this.damage = damage;
  this.attack_delay = attack_delay;
  this._parent = parent;
}
Weapon.prototype = Object.create(Prop.prototype);
Weapon.prototype.constructor = Weapon;
/**
 * Potion class.
 *
 * @constructor
 * @param {Class} parent - родитель зелья
 * @param {String} name - имя зелья
 * @param {Number} healing - лечение зелья
 */
function Potion (parent,name, healing){
  Prop.call(this, name);
  this.healing = healing;
  this._parent = parent;
}
Potion.prototype = Object.create(Prop.prototype);
Potion.prototype.constructor = Potion;
