// canvas
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 900;
canvas.height= 600;
let canvasPosition = canvas.getBoundingClientRect();
let score = 0;
let winningScore = 100
let chosenDefender = 0;
//GRID
const GRID_SIZE = 100;
const GRID_GAP = 3;
const gameGrid = [];

class Grid {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.width = GRID_SIZE;
		this.height = GRID_SIZE;
		this.takeover = false;
	}

	draw() {
		if (!mouse.x || !mouse.y || !collision(this, mouse)) return 
		ctx.strokeStyle = 'black';
		ctx.strokeRect(this.x, this.y, this.width, this.height)
	}

	static getGrid(x, y) {
		let X = Math.floor(x / GRID_SIZE)
		let Y = Math.floor(y / GRID_SIZE) - 1
		return gameGrid[Y * (canvas.width / GRID_SIZE) + X];
	}
}

function createGrid() {
	for (let row = GRID_SIZE; row < canvas.height; row += GRID_SIZE) {
		for (let col = 0; col < canvas.width; col += GRID_SIZE) {
			gameGrid.push(new Grid(col, row));
		}
	}
}

function handleGrid() {
	gameGrid.forEach(grid => {
		grid.draw();
	})
}

//mouse
const mouse = {
	x: undefined,
	y: undefined,
	width: 0.1,
	height: 0.1,
	clicked: false
}

canvas.addEventListener('mousedown', e => {
	mouse.clicked = true
})

canvas.addEventListener('mouseup', e => {
	mouse.clicked = false
})

canvas.addEventListener('mousemove', e => {
	mouse.x = e.x - canvasPosition.left;
	mouse.y = e.y - canvasPosition.top;
	
});
canvas.addEventListener('mouseleave', () => {
	mouse.x = undefined;
	mouse.y = undefined;
})

window.addEventListener('resize', () => {
	canvasPosition = canvas.getBoundingClientRect()
})
// controlBar
const controlBar = {
	width: canvas.width,
	height: GRID_SIZE,
}
function handleGameData(){
	ctx.fillStyle = 'black'
	ctx.font = '30px Orbitron'
	ctx.fillText('Score: ' + score, 400, 40)
	ctx.fillText('Resource: ' + resourceNum, 400, 80)

	if (gameover) {
		// ctx.fillStyle = 'black';
		// ctx.font = '90px Orbitron';
		// ctx.fillText('GAME OVER', 135, 330)

		ctx.fillStyle = 'black'
		ctx.font = '60px Orbitron'
		ctx.fillText('GAME OVER', 200, 300)
		ctx.font = '30px Orbitron'
		ctx.fillText('You  got '+score+' point!', 200, 340)
	}

	// if(score >= winningScore && enemies.length==0){
	// 	ctx.fillStyle = 'black'
	// 	ctx.font = '60px Orbitron'
	// 	ctx.fillText('LEVEL COMPLETE', 130, 300)
	// 	ctx.font = '30px Orbitron'
	// 	ctx.fillText('You win with '+score+' point!', 134, 340)
	// }
}

//floating text
const floatingMsgs = [];

class FloatingMsg {
	constructor(value, x, y, size, color){
		this.value = value;
		this.x = x;
		this.y = y;
		this.size = size;
		this.color = color;
		this.lifespan = 0;
		this.opacity = 1;
	}

	update(){
		this.y -= 0.3
		this.lifespan += 1;
		if(this.opacity > 0.05) this.opacity -= 0.03

	}

	draw() {
		ctx.globalAlpha = this.opacity
		ctx.fillStyle = this.color
		ctx.font = this.size + 'px Orbitron'
		ctx.fillText(this.value, this.x, this.y)
		ctx.globalAlpha = 1;
		
	}
}

function handleFloatMsg(){
	for (let i = 0; i < floatingMsgs.length; i++) {
		floatingMsgs[i].update()
		floatingMsgs[i].draw()
		if (floatingMsgs[i].lifespan >= 50) {
			floatingMsgs.splice(i,1)
			--i;
		}
	}
}

// defenders
const defenders = [];
const DEFENDER = [];



const defender1 = new Image();
defender1.src = 'defender/meat/meat.png'

const defender2 = new Image();
defender2.src = 'defender/meat/blue.png'

const defender3 = new Image();
defender3.src = 'defender/meat/pink.png'

const defender4 = new Image();
defender4.src = 'defender/meat/purple.png'

DEFENDER.push({img: defender1, width:600, height: 600, health:160,  timer: 6, cost:100, attackFrame:22, idle:{minFrame: 0, maxFrame: 6}, attack:{minFrame: 7, maxFrame: 24}})
DEFENDER.push({img: defender2, width:800, height: 800, health:120,  timer: 5, cost:125, attackFrame:22, idle:{minFrame: 0, maxFrame: 6}, attack:{minFrame: 7, maxFrame: 24}})
DEFENDER.push({img: defender3, width:800, height: 800, health:120,  timer: 8, cost:150, attackFrame:22, idle:{minFrame: 0, maxFrame: 6}, attack:{minFrame: 7, maxFrame: 24}})
DEFENDER.push({img: defender4, width:800, height: 800, health:90, timer: 4, cost:180, attackFrame:22, idle:{minFrame: 0, maxFrame: 6}, attack:{minFrame: 7, maxFrame: 24}})

const TIMER_DF = 5;
class Defender {
	constructor(x, y, type) {

		this.type = type;
		this.x = x;
		this.y = y;
		this.width = GRID_SIZE;
		this.height = GRID_SIZE;
		this.shooting = false;
		this.health = DEFENDER[type].health;
		this.bullets = [];
		this.timer = TIMER_DF;
		this.attackTimer = DEFENDER[type].timer;
		// this.timer = 0; //?
		// this.interval = 50;
		this.img = DEFENDER[type].img
		this.frameX = 0;
		this.frameY = 0;
		this.spriteWidth = DEFENDER[type].width
		this.spriteHeight = DEFENDER[type].height
		this.minFrame = DEFENDER[type].idle.minFrame;
		this.maxFrame = DEFENDER[type].idle.maxFrame;
		this.shootNow = false;
		
		
	}
	draw() {
		// ctx.fillStyle = 'blue';
		// ctx.fillRect(this.x, this.y,this.width,this.height)

		// ctx.fillStyle = 'black'
		// ctx.font = '30px Orbitron'
		// ctx.fillText(Math.floor(this.health),this.x + 25, this.y + 30)
		

		ctx.fillStyle = 'grey';
		ctx.fillRect(this.x + 15, this.y + 5,70,10)

		ctx.fillStyle = 'red';
		ctx.fillRect(this.x + 15, this.y + 5,this.health/DEFENDER[this.type].health*70,10)
		ctx.drawImage(this.img, this.frameX * this.spriteWidth + 5, 0 ,this.spriteWidth, this.spriteHeight,this.x,this.y,this.width,this.height)

	}
	update(){

		if (frame % this.timer == 0) {
			if (this.frameX < this.maxFrame) ++this.frameX
			else this.frameX = this.minFrame;

			if(this.frameX==DEFENDER[this.type].attackFrame)this.shootNow = true
		}

		this.shooting = enemyLine.indexOf(this.y) != -1

		if (this.shooting) {
			this.minFrame = DEFENDER[this.type].attack.minFrame;
			this.maxFrame = DEFENDER[this.type].attack.maxFrame;
			this.timer = this.attackTimer;
		}else {
			this.minFrame = DEFENDER[this.type].idle.minFrame;
			this.maxFrame = DEFENDER[this.type].idle.maxFrame;
			this.timer = TIMER_DF;
		}

		if(this.shooting && this.shootNow){
			// this.timer++;
			// if (this.timer % this.interval == 0) {
				bullets.push(new Bullet(this.x + 30, this.y + 5, this.type))
				this.shootNow = false
			// }
		}
		else{
			// this.timer = 0;
		
		}
		
	}
}


function handleDefender() {
	const die = []
	
	for(let i = 0; i < defenders.length; ++i){
		defenders[i].update();
		defenders[i].draw();
		const crash = [];
		// enemies.forEach(enemy => {

		// 	if(!enemy.dying && collision(defenders[i], enemy)){
		// 		defenders[i].health -= enemy.attack;
		// 		enemy.movement = 0;
		// 		crash.push(enemy)
		// 	}
			
		// })
		// if(defenders[i].health <= 0){
		// 	defenders.splice(i,1);
		// 	--i;
		// 	crash.forEach(e => {
		// 		e.movement = e.speed;
		// 	})
		// }

		if (defenders[i].health <= 0) {
			enemies.forEach(enemy => {
				if (enemy && enemy.target == defenders[i]) {
					enemy.target = null;
					enemy.maxFrame = ENEMY[enemy.type].maxFrame['run']
					enemy.minFrame = ENEMY[enemy.type].minFrame['run']
					//enemy.frameX = enemy.minFrame
					enemy.movement = enemy.speed;

				}
			})
			defenders.splice(i,1)
			--i
		}

	}	
	
}
// const card1 = {
// 	x: 10,
// 	y: 10,
// 	width: 80,
// 	height: 80
// }
// const card2 = {
// 	x: 100,
// 	y: 10,
// 	width: 80,
// 	height: 80
// }
function chooseDefender(){

	let flag = true;
	

	for (var i = 0; i < DEFENDER.length; i++) {
		const card = {
			x: 10 + 90 * i,
			y: 10,
			width: 80,
			height: 80
		}
		ctx.strokeStyle = 'black';
		ctx.lineWidth = 2;
		ctx.fillStyle = 'rgba(0,0,0,0.2)'
		ctx.fillRect(card.x, card.y, card.width, card.height)

		if(flag && collision(mouse, card) && mouse.clicked){
			chosenDefender = i;
			flag = false;
		}
		if(chosenDefender == i)ctx.strokeStyle = 'gold';
		ctx.strokeRect(card.x, card.y, card.width, card.height)
		ctx.drawImage(DEFENDER[i].img, 0, 0, DEFENDER[i].width, DEFENDER[i].height, card.x, card.y + 10, card.width, card.height)
		ctx.fillStyle = 'black'
		ctx.font = '20px Orbitron'
		ctx.fillText(DEFENDER[i].cost+'$', card.x + 11, card.y + 25)
}
	
	// ctx.strokeStyle = card2stroke
	// ctx.strokeRect(card2.x, card2.y, card2.width, card2.height)
	// ctx.fillRect(card2.x, card2.y, card2.width, card2.height)
	// ctx.drawImage(defender2, 600, 0, 600, 600, card2.x, card2.y, card2.width, card2.height)
}

//enemy
let enemies = [];
let enemyLine = []
let frame = 0;
let enemyInterval = 300
let gameover = false;

const ENEMY = [];

const TIMER_EM = 10;
// const enemy1 = new Image();
// enemy1.src = 'enemy/enemy1.png'
// ENEMY.push({img:enemy1, width:144, height:144, minFrame:{run:0,dying:5},maxFrame:{run:4,dying:11}})

// const enemy2 = new Image();
// enemy2.src = 'enemy/enemy2.png'
// ENEMY.push({img:enemy2, width:256, height:256, minFrame:{run:0,dying:5},maxFrame:{run:4,dying:15}})

// // const enemy4 = new Image();
// // enemy4.src = 'enemy/enemy4.png'
// // ENEMY.push({img:enemy4, width:384, height:256, minFrame:{run:0,dying:6},maxFrame:{run:5,dying:13}})



const bat = new Image();
bat.src = 'enemy/bat/bat.png'
ENEMY.push({img:bat, width:600, height:600, health:70, gain:10,speed:1.3,timer:10,attack:10, offset:{x:30,y:0,z:0}, attackFrame:6,minFrame:{run:0,attack:3,dying:8},maxFrame:{run:2,attack:7,dying:13}})


const bat2 = new Image();
bat2.src = 'enemy/bat/bat1.png'
ENEMY.push({img:bat2, width:800, height:800, health:80, gain:15,speed:1,timer:10,attack:10, offset:{x:30,y:20,z:50}, attackFrame:6,minFrame:{run:0,attack:3,dying:8},maxFrame:{run:2,attack:7,dying:13}})


const enemy5 = new Image();
enemy5.src = 'enemy/enemy5.png'
ENEMY.push({img:enemy5, width:256, height:256,health:100,gain:15,speed:0.8,timer:9,attack:15,offset:{x:25,y:20,z:0},attackFrame:16,minFrame:{run:0,attack:5,dying:20},maxFrame:{run:4,attack:19,dying:29}})

const enemy9 = new Image();
enemy9.src = 'enemy/enemy9.png'
ENEMY.push({img:enemy9, width:256, height:256,health:100,gain:25,speed:1,timer:8,attack:10, offset:{x:25,y:20,z:0},attackFrame:12,minFrame:{run:0,attack:8,dying:15},maxFrame:{run:7,attack:14,dying:21}})

const enemy12 = new Image();
enemy12.src = 'enemy/enemy12.png'
ENEMY.push({img:enemy12, width:256, height:256,health:120,gain:50,speed:1.2,timer:10,attack:20,offset:{x:30,y:0,z:0},attackFrame:13,minFrame:{run:0,attack:8,dying:20},maxFrame:{run:7,attack:19,dying:28}})

// const enemy15 = new Image();
// enemy15.src = 'enemy/enemy15.png'
//ENEMY.push({img:enemy15, width:256, height:256,health:100,gain:20,speed:1.2,timer:10,attack:20,offset:{x:0,y:0,z:0},attackFrame:13,minFrame:{run:0,attack:8,dying:20},maxFrame:{run:7,attack:19,dying:28}})

class Enemy {
	constructor(line,type) {
		this.x = canvas.width
		this.y = line
		this.width = GRID_SIZE;
		this.height = GRID_SIZE;
		this.speed = ENEMY[type].speed + 100/enemyInterval//Math.random() * 0.2 + 0.4; //0.4 - 0.6
		this.movement = this.speed; //?
		this.health = ENEMY[type].health;
		this.maxHealth = this.health; //?
		this.attack = ENEMY[type].attack
		this.gain = ENEMY[type].gain;
		this.type = type
		this.timer = TIMER_EM;
		this.attackTimer = ENEMY[type].timer
		this.img = ENEMY[this.type].img
		this.frameX = ENEMY[this.type].minFrame['run']
		this.frameY = 0;
		this.minFrame = 0;
		this.maxFrame = ENEMY[this.type].maxFrame['run']
		this.spriteWidth = ENEMY[this.type].width
		this.spriteHeight = ENEMY[this.type].height
		this.dying = false
		this.die = false
		this.attacking = false
		this.target = null;
		this.offset = ENEMY[this.type].offset;
	}

	update(delta){
		// this.x -= delta * Math.random() * 0.04 + 0.01;
		if(!this.dying)
		this.x -= this.movement

		if (frame%this.timer==0) {

			if (this.frameX < this.maxFrame) ++this.frameX
			else {
				if(this.dying) return this.die = true
				this.frameX = this.minFrame
			};
			if(this.frameX == ENEMY[this.type].attackFrame){
				this.target.health -= this.attack
			}
		}
	}
	draw(){
		// ctx.fillStyle = 'red'
		// ctx.fillRect(this.x, this.y, this.width, this.height)
		// ctx.fillStyle = 'silver'
		// ctx.font = '30px Orbitron'
		// ctx.fillText(Math.floor(this.health),this.x + 25, this.y + 30)
		if (!this.dying) {
			ctx.strokeStyle = 'black';
			 ctx.strokeRect(this.x, this.y + 5, this.health/this.maxHealth*60, 5);
			// ctx.strokeRect(this.x, this.y, this.width,this.height);
			ctx.fillStyle = this.freeze ? 'skyblue':'red';
			ctx.fillRect(this.x, this.y + 5, this.health/this.maxHealth*60, 5)
		}
		ctx.drawImage(this.img, this.frameX * (this.spriteWidth+2) + this.offset.z, 0+ this.offset.y*2 ,this.spriteWidth-2*this.offset.z, this.spriteHeight-2*this.offset.z,this.x - this.offset.x,this.y,this.width,this.height)
	}
}

function handleEnemy(delta){
	const die = []
	
	for(let i=0; i<enemies.length;++i) {
		enemies[i].update(delta)
		if (enemies[i].die) {
			enemies.splice(i,1)
			--i;
			continue
		}
		enemies[i].draw();

		if(enemies[i].dying)continue;

		if (enemies[i].x <= 0) {
			gameover = true;
			enemyLine = [];
			enemies = [];
			document.addEventListener('keydown',e => {
				if (e.keyCode == 32) {
					location.reload();
				}
			})
			return
		}
		if (enemies[i].health <= 0) {
			// let gain = enemies[i].maxHealth/10;
			let gain = enemies[i].gain
			resourceNum += gain
			score += gain;
			
			floatingMsgs.push(new FloatingMsg('+'+gain,enemies[i].x,enemies[i].y,30,'black'))
			floatingMsgs.push(new FloatingMsg('+'+gain,600,50,30,'red'))
			let j = enemyLine.indexOf(enemies[i].y)
			enemyLine.splice(j,1);
			
			enemies[i].dying = true
			enemies[i].timer = TIMER_EM;
			enemies[i].minFrame = ENEMY[enemies[i].type].minFrame['dying'];
			enemies[i].maxFrame = ENEMY[enemies[i].type].maxFrame['dying'];
			enemies[i].frameX = enemies[i].minFrame - 1
		}

		for(let k = 0; k < defenders.length; ++k){
			if (enemies[i].target) {
				break;
			}
			if(collision(defenders[k],enemies[i])){
				enemies[i].target = defenders[k];
				enemies[i].movement = 0;
				enemies[i].minFrame = ENEMY[enemies[i].type].minFrame['attack'];
				enemies[i].maxFrame = ENEMY[enemies[i].type].maxFrame['attack'];
				enemies[i].frameX =  enemies[i].minFrame - 1
				enemies[i].timer = enemies[i].attackTimer;
			}

		}


	}

	if (frame % enemyInterval == 0 && !gameover) {
		let line = Math.floor(Math.random() * (canvas.height/GRID_SIZE - 1) + 1) * GRID_SIZE;
		if(line/GRID_SIZE > 3){
			var n = Math.floor(Math.random()*((ENEMY.length-1) - 2 + 1) + 2);
		}else{
			var n = Math.floor(Math.random()*2 + 0);
		}
		
		enemies.push(new Enemy(line,n))
		enemyLine.push(line)

		if (enemyInterval > 100) {enemyInterval -= 5}
	}
	
	
	
}
//bullet
const bullets = []
const BULLET = [];

const bullet1 = new Image();
bullet1.src = 'bullet/orange/bullet.png'
const bullet2 = new Image();
bullet2.src = 'bullet/blue/bullet.png'

const bullet3 = new Image();
bullet3.src = 'bullet/pink/bullet.png'

const bullet4 = new Image();
bullet4.src = 'bullet/purple/bullet.png'

const bullet5 = new Image();
bullet5.src = 'bullet/purple/bullet.png'

BULLET.push({img:bullet1, speed:5, timer:10, power: 10, size:0})
BULLET.push({img:bullet2, speed:5, timer:10, power: 12, size:0})
BULLET.push({img:bullet3, speed:3, timer:10, power: 25, size:50})
BULLET.push({img:bullet4, speed:7, timer:10, power: 15, size:0})


class Bullet{
	constructor(x,y,type){
		this.x = x;
		this.y = y;
		this.type = type
		this.width = 80
		this.height = 80
		this.power = BULLET[type].power;
		this.speed = BULLET[type].speed;
		this.timer = BULLET[type].timer;
		this.size = BULLET[type].size;
		this.frameX = 1;
		this.maxFrame = 2;
		this.minFrame = 0;
		this.spriteWidth = 300;
		this.spriteHeight = 300;
		this.type = type
		this.die = false
		this.freeze = false;
		this.freezeTimeout = '';
	}

	update(){

		if (!this.bomb)
		this.x += this.speed;
		
		if (frame%this.timer==0) {
			if(this.frameX >= this.maxFrame) {
				if(this.bomb) return this.die = true		
				return this.frameX = this.minFrame;
			}
			++this.frameX;
		}
	}

	draw(){
		// ctx.fillStyle = 'black'
		// ctx.beginPath();
		// ctx.arc(this.x,this.y,this.width,0,Math.PI * 2);
		// ctx.fill();
		ctx.drawImage(BULLET[this.type].img, this.frameX * this.spriteWidth + this.size, 0 + this.size ,this.spriteWidth- 2 * this.size, this.spriteHeight- 2 * this.size,this.x + 30,this.y,this.width,this.height)

	}
}

function handleBullet() {
	
	for(let i=0; i<bullets.length; ++i){
		bullets[i].update()
		if(bullets[i].die){
			bullets.splice(i,1);
			--i
			continue;
		}
		bullets[i].draw()
		// let flag = true
		for(let j=0; j<enemies.length; ++j){
			if(bullets[i].bomb) break;
			if(!enemies[j].dying&&collision(bullets[i], enemies[j])) {
				enemies[j].health -= bullets[i].power
				if(bullets[i].type == 1){
					if(enemies[j].freeze){
						clearTimeout(enemies[j].freezeTimeout);
					}else{
						if (!enemies[j].target)
						enemies[j].movement = enemies[j].speed *0.75

						enemies[j].freeze = true;
					}
					let em = enemies[j];
					enemies[j].freezeTimeout = setTimeout(() => {
							if (em.dying) {return}
							em.movement = em.target==undefined ? 0 :em.speed;
							em.freeze = false;
						}, 3000)

				}
				bullets[i].minFrame = 4
				bullets[i].maxFrame = 6
				bullets[i].frameX = bullets[i].minFrame - 1
				bullets[i].bomb = true;
				// bullets.splice(i,1);
				// --i;
				// flag = false;
			}
		}
		if (bullets[i].x > canvas.width) {
			bullets.splice(i,1);
			--i;
		}
	}
}

//resource
let resourceNum = 5000;
const resources = [];
const amounts = [20, 30, 40]
const flower1 = new Image()
flower1.src = 'flower.png'
const flower2 = new Image()
flower2.src = 'flower2.png'
const flower3 = new Image()
flower3.src = 'flower3.png'
const FLOWER = [flower1,flower2,flower3]

class Resource{
	constructor(){
		this.x = Math.random() * (canvas.width - GRID_SIZE)
		this.y = 0
		this.dy = (Math.floor(Math.random() * 5) + 1) * GRID_SIZE + 25
		this.width = GRID_SIZE * 0.6
		this.height = GRID_SIZE * 0.6
		this.amount = amounts[Math.floor(Math.random() * amounts.length)]
		this.img = FLOWER[Math.floor(Math.random()*FLOWER.length)]
	}

	draw(){
		// ctx.fillStyle = 'yellow'
		// ctx.fillRect(this.x, this.y, this.width, this.height)

		ctx.fillStyle = 'black'
		ctx.font = '20px Orbitron'
		ctx.fillText(this.amount, this.x + 15, this.y - 5)
		ctx.drawImage(this.img,this.x,this.y,this.width,this.height)
	}
	update(){
		if (this.y < this.dy) {
			this.y ++;
		}

	}
}
function handleResource(){

	var pick = []
	if(frame % 300 == 0 && !gameover){
		resources.push(new Resource())
	}
	resources.forEach((resource,i) => {
		resource.update()
		resource.draw()
		if(mouse.x && mouse.y && collision(resource, mouse)){
			resourceNum += resource.amount
			//floatingMsgs.push(new FloatingMsg('+'+resource.amount,resource.x,resource.y,30,'black'))
			floatingMsgs.push(new FloatingMsg('+'+resource.amount,600,50,30,'pink'))
			pick.push(i)
		}
	})
	pick.forEach((i,j) => {
		resources.splice(i-j,1)
	})
}
//Loop




canvas.addEventListener('click', () => {

	if (mouse.y < GRID_SIZE) return 

	const gridX = mouse.x - (mouse.x % GRID_SIZE)
	const gridY = mouse.y - (mouse.y % GRID_SIZE)

	if (defenders.some(e => e.x == gridX && e.y == gridY)) 
		return floatingMsgs.push(new FloatingMsg('Occupied Already',mouse.x,mouse.y,15,'red'))

	let defenderCost = DEFENDER[chosenDefender].cost;
	if (resourceNum >= defenderCost) {
		defenders.push(new Defender(gridX,gridY,chosenDefender))
		
		resourceNum -= defenderCost;
	}else {
		floatingMsgs.push(new FloatingMsg('No Resources',mouse.x,mouse.y,15,'blue'))
	}
	
})

let lastTime;
const bg = new Image()
bg.src = 'bgg.jpeg'

const nav = new Image();
nav.src = 'nav.png';
function Update(time) {

	// if (lastTime == null) {
	// 	lastTime = time;
	// 	requestAnimationFrame(Update)
	// 	return
	// }
	// const delta = time - lastTime;
	// lastTime = time;
	++frame;

	ctx.clearRect(0,0,canvas.width,canvas.height);
	// ctx.fillStyle = 'blue';
	// ctx.fillRect(0, 0, controlBar.width, controlBar.height);

	ctx.drawImage(bg,0,controlBar.height ,900,600)
	handleGrid();
	handleDefender()
	handleEnemy(/*delta*/)
	handleBullet()
	
	handleResource()
	chooseDefender()
	handleGameData()
	handleFloatMsg()
	


	requestAnimationFrame(Update);
}

function collision(first, second){

	const flag = first.x > second.x + second.width ||
				 first.x + first.width < second.x ||
				 first.y >= second.y + second.height||
				 first.y + first.height <= second.y;
	return !flag;
}


/* ******************************************** */
createGrid();
Update();

