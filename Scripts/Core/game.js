var canvas;
var drawingSurface;
var _log;
var map = [];
var images = [];
var imgNames = ["Assets/images/background.png", "Assets/images/ch_playerCar.png"];
var truckImg = ["Assets/images/ch_truck01.png","Assets/images/ch_truck02.png",
				"Assets/images/ch_truck03.png","Assets/images/ch_truck04.png"]
var pickupImg = ["Assets/images/pk_addHealth.png", "Assets/images/pk_addScore.png"]
var SIZE;
var isRunning;
var paused;
var player;
var score;
var moveBounds;
var trucks = [];
var pickups = [];
var mapSpeed;
var speedMultiplier;
var leftPressed;
var rightPressed;
var upPressed;
var downPressed;
var trucksInPlay;
var updateInterval;
var truckSpawnInterval;
var pickupSpawnInterval;
var scoreGainInterval;
var freeze;
var cheatsEnabled;

Start();

function Start() //Handles getting the game up and running.
{
	Initialize();
	loadImages();
	generateBackground();
	buildArray();
	window.addEventListener("keydown", onKeyDown);
	window.addEventListener("keyup", onKeyUp);
}	

function Initialize()  //Sets beginning values of all core variables.
{
	player = 
	{
		x:475,
		y:475,
		speed:14,
		HP: 4,
		dX:0,
		dY:0,
		image:null	
	};
	moveBounds = {left:125, right:660, top:100, bottom:520};
	_log = document.getElementById("log");
	canvas = document.getElementById("canvas");
	drawingSurface = canvas.getContext("2d");
	SIZE = 150;
	mapSpeed = 16;
	trucksInPlay = 0;
	updateInterval = setInterval(update, 33.34);
	truckSpawnInterval = setInterval(trySpawnTrucks, 400); //Every half a second, we try to spawn trucks.
	pickupSpawnInterval = setInterval(trySpawnPickup, 500);
	scoreGainInterval = setInterval(addScore, 300);
	leftPressed = false;
	rightPressed = false;
	upPressed = false;
	downPressed = false;
	pausePressed = false;
	speedMultiplier = 1;
	score = 0;
	paused = false;
	isRunning = true;
	cheatsEnabled = true;
	freeze = false;
}

function buildArray() //turns the 1D array for trucks into a 2D array.
{
	for(var i = 0; i < 4; i++)
	{
		trucks[i] = [];
	}
}

function loadImages() //turns the imageNames string array into an array of Image variables.
{
	for ( var i = 0; i < imgNames.length; i++)
	{
		var tempImg = new Image();
		tempImg.src = imgNames[i];
		images.push(tempImg);
	}
	player.image = images[1];
}

function loadTruckImg()
{
	for ( var i = 0; i < truckImg.length; i++)
	{
		var tempImg = new Image();
		tempImg.src = truckImg[i];
		images.push(tempImg);
	}
}

function generateBackground() //Creates the 1D tile array for the background
{
	for(var i = 0; i < 7; i++)
	{
		var tempTile = {};
		tempTile.x = 0; 
		tempTile.y = i*SIZE-150;
		tempTile.type = 0;
		map[i] = tempTile;
	}
}

function update()
{
	if(isRunning && !paused)
	{
		trucksInPlay = countTrucksInPlay();
		if(isDead())
		{
			if(!freeze )
			{
				moveTrucks();
				movePickups();
			}
			scrollBackground();
		
			movePlayer();
			collisionSweep();
		}
		displayHP();
		render();
	}
	
}

function isDead()
{
	if(player.HP > 0) return true;
	else return false;
}

function trySpawnTrucks()
{
	if(canSpawnTrucks())
	{
		var spawned = false;
		//We loop through the lanes
		for(var lane = 0; lane < 4; lane++)
		{
			if(laneIsOpen(lane) && !spawned)	
			{
				var chance = Math.random() * 100;
				if(chance <= 10)
				{
					spawnTruck(lane);
					spawned = true;
				}
			}
		}
	}
}

function trySpawnPickup()
{
	var spawned = false;
	var chance = Math.random() * 100;
	if(chance <= 20)
	{
		spawnPickup();
		spawned = true;
	}
}

function scrollBackground() //Moves the background
{
	//move the whole map downwards steadily
	for (var row = 0; row < map.length; row++)
	{
		map[row].y += mapSpeed;
	}
	
	//if the tiles reach the start position of their leading tiles, reset their positions to their starting positions
	if (map[0].y >= 0)
	{
		for(var row = 0; row < 7; row++)
		{	
			map[row].y -= SIZE;
		}
	}
	
}

function render()
{
	//Render background
	for ( var row = 0; row < 7; row++ )
	{
		drawingSurface.drawImage(images[map[row].type], map[row].x, map[row].y, 900, 150);
	}
	//Render player
	drawingSurface.drawImage(player.image,player.x,player.y);

	//render pickups
	for(var i = 0; i < pickups.length; i++)
	{
		drawingSurface.drawImage(pickups[i].image, pickups[i].x +25, pickups[i].y+75);
	}
	//Render trucks
	for(var i = 0; i < trucks.length; i++)
	{
		for(var j = 0; j < trucks[i].length; j++)
		{
			drawingSurface.drawImage(trucks[i][j].image, trucks[i][j].x, trucks[i][j].y - 50);
		}
	}

	
}

function onKeyDown(event)
{
	switch(event.keyCode)
	{
		case 37: // Left.
		case 65:
				if ( leftPressed == false )
					leftPressed = true;
				break;
		case 39: // Right.
		case 68:
				if ( rightPressed == false )
					rightPressed = true;
				break;
		case 38: // Up.
		case 87:
				if ( upPressed == false )
					upPressed = true;
				break;
		case 40: // Down.
		case 83:
				if ( downPressed == false )
				downPressed = true;
				break;
		case 80:		// P key, for pausing.
				if( paused == false )
				paused = true;
				else
				paused = false;
				break;
		case 70:		// F key, to freeze trucks in place.  For debug purposes only.
				if(cheatsEnabled)
				{
					if( freeze == false )
					freeze = true;
					else
					freeze = false;
				}
				break;
		default:
				console.log("Unhandled key.");
				break;
	}
}

function onKeyUp(event)
{
	switch(event.keyCode)
	{
		case 37: // Left.
		case 65:
				leftPressed = false;
				break;
		case 39: // Right.
		case 68:
				rightPressed = false;
				break;
		case 38: // Up.
		case 87:
				upPressed = false;
				break;
		case 40: // Down.
		case 83:
				downPressed = false;
				break;
		default:
				console.log("Unhandled key.");
				break;
	}
}

function movePlayer()
{
	if ( leftPressed == true && player.x > moveBounds.left) 
		player.x -= player.speed; 
	if ( rightPressed == true && player.x < moveBounds.right)
		player.x += player.speed;
	if ( upPressed == true && player.y > moveBounds.top)
		player.y -= player.speed;
	if ( downPressed == true && player.y < moveBounds.bottom)
		player.y += player.speed;
}

function moveTrucks()
{
	for(var lane = 0; lane < trucks.length; lane++)
	{
		for(var pos = 0; pos < trucks[lane].length; pos++)
		{
			if(trucks[lane][pos])
			{
				trucks[lane][pos].y += trucks[lane][pos].speed;
				if(trucks[lane][pos].y > 900)
				{
					trucks[lane].splice(pos,1);
				}
				else if(trucks[lane][pos].y > player.y + 100 && trucks[lane][pos].inPlay)
				{
					trucks[lane][pos].inPlay = false;
				}
				
			}
		}
	}
}

function movePickups()
{
	for(var i = 0; i < pickups.length; i++)
	{
		if(pickups[i])
		{
			pickups[i].y += pickups[i].speed;
			if(pickups[i].y > 900)
			{
					pickups.splice(i,1);
			}
		}
	}
}

function spawnTruck(lane) //spawns a new obstacle in the desired lane.
{
	var tempTruck = 
	{
		x:140+170*lane, 
		y:-250, 
		speed:8, 
		dX:0, 
		dY:0, 
		image:null, 
		inPlay:true,
		collidable:true
	};
	var ranTruckImg = Math.floor(Math.random()*4);
	tempTruck.image = new Image();
	tempTruck.image.src = truckImg[ranTruckImg];
	var pos = 0;
	trucks[lane].push(tempTruck);
	
}

function spawnPickup()
{
	var tempPickup =
	{
		x:120 + Math.floor(Math.random()*610), 
		y:-200, 
		speed:mapSpeed, 
		image:null,
		type:0
	}
	var ranPickupImg = Math.floor(Math.random()*2);
	tempPickup.image = new Image();
	tempPickup.image.src = pickupImg[ranPickupImg];
	tempPickup.type = ranPickupImg;
	pickups.push(tempPickup);
}

function countTrucksInLane(lane) //Simply tallies the number of trucks in a specific designated lane.
{
	if(trucks[lane] == null)
		return 0;
	var count = 0;
	for(var pos = 0; pos < trucks[lane].length; pos++)
	{
		if(trucks[lane][pos])
			count++;
	}
	return count;
	
}

function countTrucksInPlay() //Tallies how many trucks are currently flagged as in play.
{	
	var num = 0;
	
	for(var lane = 0; lane < trucks.length; lane++)
	{
		for(var pos = 0; pos < trucks[lane].length; pos++)
		{
			if(trucks[lane][pos].inPlay)
				num++;
		}
	}
	return num;
}

function canSpawnTrucks()	//Simple gatekeeper function to ensure that there aren't too many obstacles for the player to avoid.
{
	if(trucksInPlay < 3)
		return true;
	else
		return false;
}

function laneIsOpen(lane) //Ensures that trucks don't spawn on top of each other.
{
	if(trucks[lane] == null || trucks[lane][0] == null) 
		return true;
	if(trucks[lane][trucks[lane].length -1].y > 150)
		return true;
	
	return false;
}

function collisionSweep()
{
	for(var lane = 0; lane < trucks.length; lane++)
	{
		for(var pos = 0; pos < trucks[lane].length; pos++)
		{
			if(trucks[lane][pos].collidable)
			{
				if(collisionCheck(getBounds(player, 10,0), getBounds(trucks[lane][pos], 0,0)))
				{
					player.HP--;
					trucks[lane][pos].collidable = false;
				}
			}	
		}
	}

	for(var i = 0; i < pickups.length; i++)
	{
		if(collisionCheck(getBounds(player,10,0), getBounds(pickups[i],10,0)))
		{
			getBounds(player, 10,0);
			getBounds(pickups[i],10,10);

			if(pickups[i].type == 0 && player.HP < 4)
			{
				player.HP++;
				pickups.splice(i,1);
			}
			else if(pickups[i].type == 1)
			{
				score += 1000;
				pickups.splice(i,1);
			}
			
			
			
		}
	}

}

 function collisionCheck(box1, box2) //This function checks two bounding boxes to see if they are colliding, by comparing box1's bounds to box2's.
{
	if(box1.left < box2.right && box1.right > box2.left && box1.top < box2.bottom && box1.bottom > box2.top)
	  {
		return true;
	  }
	  else return false;
}

function collisionLog(hit)
{
	var output = "Player collided with truck at " + hit.x + ", " + hit.y + " with a bounding box ";
	var box = getBounds(hit);
	var boxout = "L: " + box.left + ", R: " + box.right + ", T: " + box.top + ", B: " + box.bottom;
	output += boxout;
	console.log(output);
}

function displayHP()
{
	_log.innerHTML = "HP   " + player.HP + "     Score   " + score;
}

function getBounds(source, xBuffer, yBuffer)
{
	var L = source.x - Math.floor(source.image.width/2) + xBuffer;
	var R = source.x + Math.ceil(source.image.width/2) - xBuffer;
	var T = source.y - Math.floor(source.image.height/2) + yBuffer;
	var B = source.y + Math.ceil(source.image.height/2) - yBuffer;
	var bounds = {left:L, right:R, top:T, bottom:B};

	return bounds;
}

function addScore()
{
	score += 10;
}