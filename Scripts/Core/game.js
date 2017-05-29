var canvas;
var drawingSurface;
var _log;
var map = [];
var images = [];
var imgNames = ["Assets/images/background.png", "Assets/images/temp_tr.png", "Assets/images/ch_playerCar.png"];
var truckImg = ["Assets/images/ch_truck01.png","Assets/images/ch_truck02.png",
				"Assets/images/ch_truck03.png","Assets/images/ch_truck04.png"]
var SIZE;
var isRunning;
var player;
var trucks = [];
var mapSpeed;
var speedMultiplier;
var leftPressed;
var rightPressed;
var upPressed;
var downPressed;
var trucksInPlay;
var updateInterval;
var truckSpawnInterval;

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
	player = {x:475, y:475, speed:10, dX:0, dY:0, image:null};
	_log = document.getElementById("log");
	canvas = document.getElementById("canvas");
	drawingSurface = canvas.getContext("2d");
	SIZE = 150;
	mapSpeed = 16;
	trucksInPlay = 0;
	updateInterval = setInterval(update, 33.34);
	truckSpawnInterval = setInterval(trySpawnTrucks, 200); //Every half a second, we try to spawn trucks.
	leftPressed = false;
	rightPressed = false;
	upPressed = false;
	downPressed = false;
	speedMultiplier = 1;
	isRunning = true;
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
	player.image = images[2];
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
	if(isRunning)
	{
		//logTruckArray();
		trucksInPlay = countTrucksInPlay();
		scrollBackground();
		moveTrucks();
		movePlayer();
		render();
	}
	
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
	drawingSurface.drawImage(player.image,player.x-SIZE/2,player.y-SIZE/2);
	//Render trucks
	for(var i = 0; i < trucks.length; i++)
	{
		for(var j = 0; j < trucks[i].length; j++)
		{
			drawingSurface.drawImage(trucks[i][j].image, trucks[i][j].x, trucks[i][j].y);
		}
	}
}

function onKeyDown(event)
{
	switch(event.keyCode)
	{
		case 37: // Left.
				if ( leftPressed == false )
					leftPressed = true;
				break;
		case 39: // Right.
				if ( rightPressed == false )
					rightPressed = true;
				break;
		case 38: // Up.
				if ( upPressed == false )
					upPressed = true;
				break;
		case 40: // Down.
				if ( downPressed == false )
				downPressed = true;
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
				leftPressed = false;
				break;
		case 39: // Right.
				rightPressed = false;
				break;
		case 38: // Up.
				upPressed = false;
				break;
		case 40: // Down.
				downPressed = false;
				break;
		default:
				console.log("Unhandled key.");
				break;
	}
}

function movePlayer()
{
	if ( leftPressed == true && player.x > 325) 
		player.x -= player.speed; 
	if ( rightPressed == true && player.x < 675)
		player.x += player.speed;
	if ( upPressed == true && player.y > 175)
		player.y -= player.speed;
	if ( downPressed == true && player.y < 675)
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
				if(trucks[lane][pos].y > player.y + 100 && trucks[lane][pos].inPlay)
				{
					trucks[lane][pos].inPlay = false;
				}
				
			}
		}
	}
	

}

function spawnTruck(lane) //spawns a new obstacle in the desired lane.
{
	var tempTruck = {x:265+100*lane, y:-200, speed:8, dX:0, dY:0, image:null, inPlay:true};
	var ranTruckImg = Math.ceil(Math.random()*4);
	tempTruck.image = new Image();
	tempTruck.image.src = truckImg[ranTruckImg];
	var pos = 0;
	trucks[lane].push(tempTruck);
	
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
	if(trucks[lane] == null || trucks[lane][0] == null)	//An empty lane is an open lane.
		return true;
	else if(trucks[lane][trucks[lane].length -1].y > 150)
		return true;
	
	return false;
}

/*function logTruckArray()	
{
	var out = "";
	for(var i = 0; i < trucks.length; i++)
	{
		out += i.toString() + ": ";
		for(var j= 0; j < trucks[i].length; j++)
		{
			out += trucks[i][j].toString() + ", ";
		}
		out += trucks[i].length + ".  ";
	}

	log.innerHTML = out;

}*/

/* function collisionCheck()
{
	var xMin = Math.floor(player.x/SIZE);	//simple calculation to turn the ship's position into integer values that can be fed into the map array's coordinates.
	var xMax = Math.ceil(player.x/SIZE);
	var yMin = Math.floor(player.y/SIZE);
	var yMax = Math.ceil(player.y/SIZE);
	//Check each background tile that the player ship is overlapping with; if an obstacle is overlapped, end game
	for(var row = xMin; row <= xMax; row++)
	{
		for(var col = yMin; col <= yMax; col++)
		{
			if(map[row][col].type == 1)
			{	
				if(map[row][col].x +100 >= player.x-50 && map[row][col].x <= player.x+50)
					if(map[row][col].y+100 >= player.y-50 && map[row][col].y <= player.y+50)
					isRunning = false;
				window.alert("the ship has crashed! game over.")
			}
		}
	}
} */