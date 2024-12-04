const NUM_BUSHES = 50;
const NUM_BALLS = 20;
const player = document.querySelector('.player');
const initialPlayerPos = {
    x: parseInt(window.innerWidth / 2),
    y: parseInt(window.innerHeight / 2),
};
const player_pos = { ...initialPlayerPos };
const player_vel = {
    x: 0,
    y: 0
};

const balls = []
const sound = new Audio('coin.mp3')
let isPokeballCollected = false;
const caughtPokemons = [];


const player_steps = 1;
const run_steps = 10; // Increased steps for running

function stopRun(){
    player_vel.x = 0;
    player_vel.y = 0;
    player.classList.remove('active');
}


function createBushes() {
    for (let i = 0; i < NUM_BUSHES; i++) {
        const div = document.createElement('div');
        div.classList.add('bush');
        div.style.left = Math.random() * 100 + '%';
        div.style.bottom = Math.random() * 100 + '%';
        document.body.appendChild(div);
    }
}


function createPokeBalls() {
        const div = document.createElement('div');
        div.classList.add('pokeball');
        const x = Math.random() * 100
        const y = Math.random() * 100
        div.style.left = x + '%';
        div.style.bottom = y + '%';
        balls.push({
            ball: div,
            pos:{
                x,
                y
            }
        })
        document.body.appendChild(div);
    }

function generatePokeBalls(){
    for(let i = 0 ; i< NUM_BALLS ; i++){
        createPokeBalls()
    }
}



// Check if two HTML elements (div1 and div2) are overlapping/colliding
function collision(div1,div2){
// Get the exact position and size of both elements relative to the viewport
const rect1 = div1.getBoundingClientRect();
const rect2 = div2.getBoundingClientRect();


// Get coordinates and dimension for the first element
const x1 = rect1.left;  // Distance from left edge of viewport
const y1 = rect1.top;   // Distance from top edge of viewport
const h1 = div1.clientHeight;    // Height of element
const w1 = div1.clientWidth;    // Width of element
const b1 = y1 + h1;  // Bottom edge position (top + height)
const r1 = x1 + w1;  

// Get coordinates and dimension for the second element
const x2 = rect2.left;
const y2 = rect2.top;
const h2 = div2.clientHeight;
const w2 = div2.clientWidth;
const b2 = y2 + h2;
const r2 = x2 + w2;

// Return true if elements overlap, false if they dont
// This checks if there is NO gap between the elements;
// - b1 < y2 : first element's bottom edge is above second element's top
// - y1 > b2 : first element's top is below second element's bottom
// - r1 < x2 : first element's right edge is left of second element's left edge
// - x1 > r2 : first element's left edge is right of second element's right edge 
return !(b1<y2||y1>b2||r1<r2||x1>r2);
}


function checkCollisions() {
    console.log("Check collision")
    balls.forEach(async(ball, index) => {
        if (collision(ball.ball, player)) {
            ball.ball.remove();
            balls.splice(index, 1);
             // Player stop auto run when catching a pokemon
            stopRun()
            isPokeballCollected = true;
            await randomizePokemon();
           
        }
    });
}

async function fetchPokemon(id){
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`)
    const data = await response.json()
    console.log('data ->',data)
    console.log('Pokemon caught')
    return data
}
async function displayPokemon(id) {
    const pokeinfo = await fetchPokemon(id);
    // Load new pokemon info
    document.getElementById('poke-img').src = pokeinfo.sprites.front_default;
    document.getElementById('poke-name').textContent = pokeinfo.name;
    const types = pokeinfo.types.map((t) => t.type.name);
    document.getElementById('poke-type-1').textContent = types[0];
    document.getElementById('poke-type-2').textContent = types[1] || '';
}

async function randomizePokemon() {
    if (isPokeballCollected) {
        const randomID = Math.ceil(Math.random() * 300);
        
        // Clear previous pokemon info before showing the new pokemon info.
        document.getElementById('poke-type-1').textContent = '';
        document.getElementById('poke-type-2').textContent = '';
        document.getElementById('poke-name').textContent = '';
        document.getElementById('poke-img').src = '';

        showPokemonModal();
        await displayPokemon(randomID);
        isPokeballCollected = false;
    }
}

function showPokemonModal() {
    const modal = document.getElementById('pokemon-modal');
    modal.style.display = 'block';
}

function hidePokemonModal() {
    const modal = document.getElementById('pokemon-modal');
    modal.style.display = 'none';
    document.getElementById('catch-result').style.display = 'none';
}

document.getElementById('catch-button').addEventListener('click', () => {
    const catchResult = Math.random() < 0.5; // 50% chance of success
    console.log("The catch result",catchResult)
    const resultText = document.getElementById('catch-result');
    resultText.style.display = 'block';

    if (catchResult) {
        resultText.textContent = 'Pokémon caught!';
        addCaughtPokemon(); // Add the Pokémon only if caught
        hidePokemonModal(); // Close the modal after catching
    } else {
        resultText.textContent = 'The Pokémon escaped!';
        setTimeout(hidePokemonModal, 2000); // Hide the modal after a short delay
    }
});

function addCaughtPokemon() {
    const pokeImg = document.getElementById('poke-img').src;
    const caughtList = document.getElementById('caught-list');
    const img = document.createElement('img');
    img.src = pokeImg;
    img.classList.add('caught-pokemon');
    caughtList.appendChild(img);
    hidePokemonModal();
}


function run() {
    player_pos.x += player_vel.x;
    player_pos.y += player_vel.y;
    player.style.left = player_pos.x + 'px';
    player.style.bottom = player_pos.y + 'px';

    checkCollisions()
    requestAnimationFrame(run);
}

function init() {
    player.style.left = player_pos.x + 'px';
    player.style.bottom = player_pos.y + 'px';
    createBushes();
    generatePokeBalls();
    run ()
}

init();

window.addEventListener('keydown', (event) => {
    let steps = player_steps;
    console.log(event)
    console.log(event.key)

    // // Press shift will increase speed
    // if (event.shiftKey === true) {
    //     steps = run_steps;
    // } else{
    //     steps = player_steps
    // }

    // Ternary Operator version
    // steps = condition? true output: false output
    steps = event.shiftKey === true? run_steps:player_steps
    // let mode = isDarkModeActivated? 'dark':'light'
    // isDarkModeActivated == true, mode = 'dark'
    // isDarkModeActivated == false, mode = 'light'


    // Player walking 
    // if (event.key === 'ArrowRight' || event.code === 'KeyD' ) {
    if (event.key === 'ArrowRight' || event.code === 'KeyD' ) {
        // Set the steps
        player_vel.x = steps;
        player.style.backgroundImage = 'url("player_right.png")';
        }

    if (event.key === 'ArrowLeft' || event.code === 'KeyA' ) {
            // Set the steps
            player_vel.x = -steps;
            player.style.backgroundImage = 'url("player_left.png")';
            }
    if (event.key === 'ArrowUp' || event.code === 'KeyW' ) {
                // Set the steps
                player_vel.y = steps;
                player.style.backgroundImage = 'url("player_front.png")';
                }
    if (event.key === 'ArrowDown' || event.code === 'KeyS' ) {
                    // Set the steps
                    player_vel.y = -steps;
                    player.style.backgroundImage = 'url("player_back.png")';
                    }

    if (event.key === 'r') {
        console.log("Player return to initial position")
        player_pos.x = initialPlayerPos.x;
        player_pos.y = initialPlayerPos.y;
    }

    player.classList.add('active');
});

window.addEventListener('keyup', (event) => {
    stopRun()
});

run();


//  Make the player interact with the pokeballs
    // 1. When player collides with a pokeball, log "pokeball caught" to the console
    // 2. It'll run the randomize Pokemon fetch API function
    // 3. It'll display the Pokemon on the screen


// Challenges
// Level 1:
// Add a randomizer logic for the pokemon when player tries to catch it
// If the player catches the pokemon, display a "You caught a new pokemon!" message 

// Level 2:
// Add a "pokeball caught" animation
// If the player doesn't catch the pokemon, display a "You missed it!" message

// Level 3: 
// Add another event listener for holding down the Shift key + arrow keys, make the player run