// Game Configuration
var title = "Minesweeper";
var levels = [
    {
        "name": "Easy",
        "grid_size": 4,
        "bombs": 2,
        "btn-class": "btn btn-success btn-lg cs-btn-margin-right cs-btn-game-level"
    },
    {
        "name": "Medium",
        "grid_size": 6,
        "bombs": 6,
        "btn-class": "btn btn-warning btn-lg cs-btn-margin-right cs-btn-game-level"
    },
    {
        "name": "Hard",
        "grid_size": 8,
        "bombs": 14,
        "btn-class": "btn btn-danger btn-lg cs-btn-game-level"
    }
]

// Game init
// Set Title
document.title = title;

// Disable right click
document.addEventListener('contextmenu', event => event.preventDefault());

var grid;
var gsize;
var bmbs;
var valid_boxes;
var game_over = false;
var game_started = false;

// Set available levels
for (var i = 0; i < levels.length; i++) {
    btn = '<button type="button" class="' + levels[i]['btn-class'] + '" onclick="game_start(' + levels[i]['grid_size'] + ', ' + levels[i]['bombs'] + ')">' + levels[i]['name'] + '</button>';
    document.getElementById('intro').childNodes[1].childNodes[1].innerHTML += btn;
}

// Functions
// Board initializer
function game_start(grid_size, bombs) {
    // Hide jumbotron
    document.getElementById('intro').style.display = 'none';

    game_started = false;

    // Create base grid
    grid = zeros([grid_size, grid_size]);
    gsize = grid_size;
    bmbs = bombs;

    // Initialize board
    for (var i = 0; i < grid_size; i++) {
        if (i < grid_size - 1) {
            document.getElementById('board').childNodes[1].childNodes[1].childNodes[1].innerHTML += '<div class="col-md-12 text-center cs-col-padding">';
        } else {
            document.getElementById('board').childNodes[1].childNodes[1].childNodes[1].innerHTML += '<div class="col-md-12 text-center">';
        }

        for (var j = 0; j < grid_size; j++) {
            box_id = i + ',' + j;
            document.getElementById('board').childNodes[1].childNodes[1].childNodes[1].childNodes[i + 1].innerHTML += '<button type="button" class="btn btn-outline-dark cs-btn-game-size" id="box' + box_id + '" onclick="box_clicked(' + box_id + ')" oncontextmenu="box_right_clicked(' + box_id + ')">-</button>';
        }
    }

    valid_boxes = gsize * gsize - bombs;

    // Show board
    document.getElementById('board').style.display = 'block';
}

function init_board(grid_size, bombs, x, y) {
    // Generating bombs
    var b = bombs;
    while (b > 0) {
        var i = Math.floor(Math.random() * grid_size);
        var j = Math.floor(Math.random() * grid_size);
        // -1 on the grid = bomb!
        if (grid[i][j] != -1 && !(i == x && j == y)) {
            grid[i][j] = -1;
            b--;
            // Calculate neighbors
            for (var k = i - 1; k <= i + 1; k++) {
                for (var l = j - 1; l <= j + 1; l++) {
                    if (k > -1 && l > -1 && k < grid_size && l < grid_size && grid[k][l] != -1) {
                        grid[k][l]++;
                    }
                }
            }
        }
    }
}

function zeros(dimensions) {
    var array = [];

    for (var i = 0; i < dimensions[0]; ++i) {
        array.push(dimensions.length == 1 ? 0 : zeros(dimensions.slice(1)));
    }

    return array;
}

function box_clicked(x, y) {
    if (game_over) {
        return;
    }

    if (!game_started) {
        init_board(gsize, bmbs, x, y);
        game_started = true;
    }

    var box_id = x + ',' + y;
    if (grid[x][y] == 0) {
        var elem = '<button type="button" class="btn btn-success cs-btn-game-size">0</button>';
        grid[x][y] = null; // for stopping the recursion
        for (var i = x - 1; i <= x + 1; i++) {
            for (var j = y - 1; j <= y + 1; j++) {
                if (i > -1 && i < gsize && j > -1 && j < gsize) {
                    box_clicked(i, j);
                }
            }
        }
        valid_boxes--;
    } else if (grid[x][y] == -1) {
        var elem = '<button type="button" class="btn btn-danger cs-btn-game-size"><i class="fas fa-bomb"></i></button>';
        game_over = true;
    } else {
        if (grid[x][y] == null) {
            return;
        }

        var elem = '<button type="button" class="btn btn-success cs-btn-game-size">' + grid[x][y] + '</button>';
        grid[x][y] = null; // for stopping the recursion
        valid_boxes--;
    }
    try {
        document.getElementById('box' + x + ',' + y).outerHTML = elem;
    } catch (TypeError) {

    }

    console.log(valid_boxes);

    // Losing condition 
    if (game_over) {
        var se = new Audio('static/audio/lose.mp3');
        se.play();
        alert("Game over!");
    }

    // Winning condition
    if (valid_boxes == 0) {
        game_over = true;
        alert("You win!");
        document.getElementById('win').childNodes[1].play();
        document.getElementById('board').style.display = 'none';
        document.getElementById('win').style.display = 'block';
    }
}

function box_right_clicked(x, y) {
    if (game_over) {
        return;
    }

    var box_id = x + ',' + y;
    var elem = '<button type="button" class="btn btn-outline-danger cs-btn-game-size" id="boxrc' + box_id + '" onclick="box_clicked(' + box_id + ')" oncontextmenu="box_right_clicked(' + box_id + ')"><i class="fas fa-flag"></i></button>';
    try {
        document.getElementById('box' + x + ',' + y).outerHTML = elem;
    } catch (TypeError) {
        document.getElementById('boxrc' + x + ',' + y).outerHTML = '<button type="button" class="btn btn-outline-dark cs-btn-game-size" id="box' + box_id + '" onclick="box_clicked(' + box_id + ')" oncontextmenu="box_right_clicked(' + box_id + ')">-</button>';
    }
}