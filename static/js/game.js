/* --- Game Configuration --- */
var TITLE = "Minesweeper";
var LEVELS = [
    {
        "name": "Easy",
        "grid_size": 8,
        "bombs": 10,
        "btn-class": "btn btn-success btn-lg cs-btn-margin-right cs-btn-game-level"
    },
    {
        "name": "Medium",
        "grid_size": 10,
        "bombs": 20,
        "btn-class": "btn btn-warning btn-lg cs-btn-margin-right cs-btn-game-level"
    },
    {
        "name": "Hard",
        "grid_size": 12,
        "bombs": 45,
        "btn-class": "btn btn-danger btn-lg cs-btn-game-level"
    }
]

/* --- Game init --- */
// Set Title
document.title = TITLE;

// Disable right click
document.addEventListener('contextmenu', event => event.preventDefault());

// Create global variables
var GRID;                   // Game board, matrix
var GRID_SIZE;              // Grid size, integer
var BOMBS;                  // How many bombs in game
var VALID_BOXES;            // Boxes without bomb
var GAME_OVER = false;      // Game over flag
var GAME_STARTED = false;   // Game is started, if a box has been clicked    

// Show available levels
for (var i = 0; i < LEVELS.length; i++) {
    btn = '<button type="button" class="'
        + LEVELS[i]['btn-class']
        + '" onclick="game_start('
        + LEVELS[i]['grid_size'] + ', '
        + LEVELS[i]['bombs'] + ')">'
        + LEVELS[i]['name']
        + '</button>';
    document.getElementById('intro').childNodes[1].childNodes[1].innerHTML += btn;
}

/* --- Functions --- */
// Called after level selected
function game_start(grid_size, bombs) {
    // Hide jumbotron
    document.getElementById('intro').style.display = 'none';

    GAME_STARTED = false;

    // Create base grid
    GRID = zeros([grid_size, grid_size]);
    GRID_SIZE = grid_size;
    BOMBS = bombs;

    // Initialize empty board
    for (var i = 0; i < grid_size; i++) {
        var div_in_html = document.getElementById('board').childNodes[1].childNodes[1].childNodes[1];

        if (i < grid_size - 1) {
            div_in_html.innerHTML += '<div class="col-md-12 text-center cs-col-padding">';
        } else {
            div_in_html.innerHTML += '<div class="col-md-12 text-center">';
        }

        for (var j = 0; j < grid_size; j++) {
            box_id = i + ',' + j;
            div_in_html.childNodes[i + 1].innerHTML += '<button type="button" class="btn btn-outline-dark cs-btn-game-size" id="box'
                + box_id + '" onclick="box_clicked(' + box_id + ')" oncontextmenu="box_right_clicked(' + box_id + ')">-</button>';
        }
    }

    VALID_BOXES = GRID_SIZE * GRID_SIZE - bombs;

    // Show board
    document.getElementById('board').style.display = 'block';
}

// Bomb location generator
function generate_bombs(grid_size, num_of_bombs, x, y) {
    var b = num_of_bombs;
    while (b > 0) {
        var i = Math.floor(Math.random() * grid_size);
        var j = Math.floor(Math.random() * grid_size);
        // -1 on the grid = bomb!
        if (GRID[i][j] != -1 && !(i == x && j == y)) {
            GRID[i][j] = -1;
            b--;
            // Calculate neighbors
            for (var k = i - 1; k <= i + 1; k++) {
                for (var l = j - 1; l <= j + 1; l++) {
                    if (k > -1 && l > -1 && k < grid_size && l < grid_size && GRID[k][l] != -1) {
                        GRID[k][l]++;
                    }
                }
            }
        }
    }
}

// Create a [N,M] matrix, filled with zeros
function zeros(dimensions) {
    var array = [];

    for (var i = 0; i < dimensions[0]; ++i) {
        array.push(dimensions.length == 1 ? 0 : zeros(dimensions.slice(1)));
    }

    return array;
}

/* --- Two functions below need to be cleaned --- */
// Called if box is clicked
function box_clicked(x, y) {
    if (GAME_OVER) {
        return;
    }

    if (!GAME_STARTED) {
        generate_bombs(GRID_SIZE, BOMBS, x, y);
        GAME_STARTED = true;
    }

    var box_id = x + ',' + y;
    if (GRID[x][y] == 0) {
        var elem = '<button type="button" class="btn btn-success cs-btn-game-size">0</button>';
        GRID[x][y] = null; // for stopping the recursion
        for (var i = x - 1; i <= x + 1; i++) {
            for (var j = y - 1; j <= y + 1; j++) {
                if (i > -1 && i < GRID_SIZE && j > -1 && j < GRID_SIZE) {
                    box_clicked(i, j);
                }
            }
        }
        VALID_BOXES--;
    } else if (GRID[x][y] == -1) {
        var elem = '<button type="button" class="btn btn-danger cs-btn-game-size"><i class="fas fa-bomb"></i></button>';
        GAME_OVER = true;
    } else {
        if (GRID[x][y] == null) {
            return;
        }

        var elem = '<button type="button" class="btn btn-success cs-btn-game-size">' + GRID[x][y] + '</button>';
        GRID[x][y] = null; // for stopping the recursion
        VALID_BOXES--;
    }
    try {
        document.getElementById('box' + x + ',' + y).outerHTML = elem;
    } catch (TypeError) {

    }

    // Losing condition 
    if (GAME_OVER) {
        var se = new Audio('static/audio/lose.mp3');
        se.play();
        alert("Game over!");
    }

    // Winning condition
    if (VALID_BOXES == 0) {
        GAME_OVER = true;
        alert("You win!");
        document.getElementById('win').childNodes[1].play();
        document.getElementById('board').style.display = 'none';
        document.getElementById('win').style.display = 'block';
    }
}

// Called if box is right clicked
function box_right_clicked(x, y) {
    if (GAME_OVER || !GAME_STARTED) {
        return;
    }

    var box_id = x + ',' + y;
    var elem = '<button type="button" class="btn btn-outline-danger cs-btn-game-size" id="boxrc' + box_id + '" oncontextmenu="box_right_clicked(' + box_id + ')"><i class="fas fa-flag"></i></button>';
    try {
        document.getElementById('box' + x + ',' + y).outerHTML = elem;
    } catch (TypeError) {
        document.getElementById('boxrc' + x + ',' + y).outerHTML = '<button type="button" class="btn btn-outline-dark cs-btn-game-size" id="box' + box_id + '" onclick="box_clicked(' + box_id + ')" oncontextmenu="box_right_clicked(' + box_id + ')">-</button>';
    }
}