const FPS = 60;
const HEIGHT = window.innerHeight * 0.75;
const WIDTH = HEIGHT;
const HEAT_SOURCE_POWER = 5000;
const HEAT_SOURCE_RADIUS = 5;

let scene = new THREE.Scene();
let camera = new THREE.OrthographicCamera(WIDTH / -2, WIDTH / 2, HEIGHT / 2, HEIGHT / -2, 1, 1000);
let raycaster = new THREE.Raycaster();
let renderer = new THREE.WebGLRenderer();
let clock = new THREE.Clock();
let mouse = new THREE.Vector2();

// Ajout de trous actif
let ajouterHeatSource = false;
let ajouterTrous = true;
let dragging = false;

// Initialize temperature matrix
let tempMatrix = initMatrix();
let size = math.size(tempMatrix);

// Heat source
let heatSources = [];
let geometryHeatSource = new THREE.CircleGeometry(HEAT_SOURCE_RADIUS);
let materialHeatSource = new THREE.MeshBasicMaterial({ color: 0xffff00 });
createHeatSource(50, 50, HEAT_SOURCE_POWER);
createHeatSource(5, 5, HEAT_SOURCE_POWER);
createHeatSource(80, 5, 500);

// Setting up threejs
let element = document.body.getElementsByClassName('three-js');
element[0].appendChild(renderer.domElement);
renderer.setSize(WIDTH, HEIGHT);
camera.position.z = 2;

let cube = null;
let delta = 0;
let nbUpdate = 0;
var update = function () {
    requestAnimationFrame(update);
    delta += clock.getDelta();

    if (delta > 1 / FPS) {
        delta = delta % (1 / FPS);

        tempMatrix = compute(tempMatrix, heatSources);
        var textureResult = convertTemperatureMatrixToTexture(tempMatrix);

        if (cube != null) scene.remove(cube);

        var geometry = new THREE.BoxGeometry(WIDTH, HEIGHT, 0);
        var material = new THREE.MeshBasicMaterial({
            map: textureResult,
        });
        cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        renderer.render(scene, camera);

        nbUpdate++;
        // console.log(nbUpdate);
    }
};

function mapTempToColor(temp) {
    const gradient = [
        [0, 192, 247],
        [28, 182, 255],
        [88, 168, 255],
        [141, 150, 255],
        [189, 127, 250],
        [228, 97, 220],
        [255, 57, 180],
        [255, 0, 130],
        [255, 0, 77],
        [255, 5, 5],
    ];

    const minHeat = 0;
    let maxHeat = 0.8 * getHottestSourceHeat();

    if (temp < minHeat) return [0, 0, 0];

    let minIndex = 0;
    let maxIndex = gradient.length - 1;

    const m = (maxIndex - minIndex) / (maxHeat - minHeat);
    let index = Math.floor(m * temp);
    if (index > maxIndex) index = maxIndex;

    return gradient[index];
}

function convertTemperatureMatrixToTexture(tempMatrix) {
    var data = new Uint8Array(4 * size[0] * size[1]); // 4* cuz rgba

    var stride = 0;
    for (var i = size[0] - 1; i >= 0; i--) {
        for (var j = 0; j < size[1]; j++) {
            var color = mapTempToColor(tempMatrix[i][j]);

            data[stride] = color[0];
            data[stride + 1] = color[1];
            data[stride + 2] = color[2];
            data[stride + 3] = 255;

            stride += 4;
        }
    }

    var texture = new THREE.DataTexture(data, size[0], size[1]);
    texture.needsUpdate = true;
    return texture;
}

function createHole(e) {
    let pos = getMatrixPosFromMousePos(e);
    tempMatrix[pos[0]][pos[1]] = -1;
    /*tempMatrix[pos[0] + 1][pos[1]] = -1;
    tempMatrix[pos[0]][pos[1] + 1] = -1;
    tempMatrix[pos[0] - 1][pos[1]] = -1;
    tempMatrix[pos[0]][pos[1] - 1] = -1;
    tempMatrix[pos[0] + 1][pos[1] + 1] = -1;
    tempMatrix[pos[0] + 1][pos[1] - 1] = -1;
    tempMatrix[pos[0] - 1][pos[1] + 1] = -1;
    tempMatrix[pos[0] - 1][pos[1] - 1] = -1;*/
}

function createHeatSource(i, j, heat) {
    var circle = new THREE.Mesh(geometryHeatSource, materialHeatSource);
    let pos = getWorldPosFromMatrixPos(i, j);
    circle.position.x = pos[0] + HEAT_SOURCE_RADIUS / 2;
    circle.position.y = pos[1] - HEAT_SOURCE_RADIUS / 2;
    circle.position.z = 1;
    scene.add(circle);

    console.log(circle.position);

    heatSources.push({
        i: i,
        j: j,
        heat: heat,
    });

    return circle;
}

function getWorldPosFromMatrixPos(i, j) {
    let stretchX = WIDTH / size[0];
    let stretchY = HEIGHT / size[1];

    return [j * stretchX - WIDTH / 2, -(i * stretchY - HEIGHT / 2)];
}

function getMatrixPosFromMousePos(e) {
    let rect = e.target.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    console.log(x, y);

    let stretchX = WIDTH / size[0];
    let stretchY = HEIGHT / size[1];

    return [Math.floor(y / stretchY), Math.floor(x / stretchX)];
}

function getHottestSourceHeat() {
    let max = 0;
    for (let i = 0; i < heatSources.length; i++) {
        if (heatSources[i].heat > max) {
            max = heatSources[i].heat;
        }
    }

    return max;
}

// EVENTS

// Toggle trous
document.getElementById('trous').addEventListener('click', (e) => {
    ajouterTrous = true;
    ajouterHeatSource = false;
    console.log(ajouterTrous, ajouterHeatSource);
});
// Toggle heat source
document.getElementById('source').addEventListener('click', (e) => {
    ajouterHeatSource = true;
    ajouterTrous = false;
    console.log(ajouterTrous, ajouterHeatSource);
});
// Toggle rien
document.getElementById('rien').addEventListener('click', (e) => {
    ajouterHeatSource = false;
    ajouterTrous = false;
    console.log(ajouterTrous, ajouterHeatSource);
});

renderer.domElement.addEventListener('click', (e) => {
    let mousePos = getMatrixPosFromMousePos(e);
    if (ajouterHeatSource) {
        createHeatSource(mousePos[0], mousePos[1], HEAT_SOURCE_POWER);
    }
});

renderer.domElement.addEventListener('mousedown', (e) => {
    dragging = true;
});

renderer.domElement.addEventListener('mouseup', (e) => {
    dragging = false;
});

renderer.domElement.addEventListener('mousemove', (e) => {
    if (dragging) {
        if (ajouterTrous) {
            createHole(e);
        } /*else if (!ajouterHeatSource) {

        }*/
    }
});

// Start update loop
update();
