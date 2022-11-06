const FPS = 60;
const HEIGHT = window.innerHeight * 0.75;
const WIDTH = HEIGHT;
const MAX_HEAT_SOURCE_POWER = 5000;
const HEAT_SOURCE_RADIUS = 5;
const init = () => {
    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(WIDTH / -2, WIDTH / 2, HEIGHT / 2, HEIGHT / -2, 1, 1000);
    raycaster = new THREE.Raycaster();
    renderer = new THREE.WebGLRenderer();
    clock = new THREE.Clock();
    mouse = new THREE.Vector2();

    stopAnimation = false;

    // Ajout de trous actif
    ajouterHeatSource = false;
    ajouterTrous = false;
    dragging = false;
    target;

    // Initialize temperature matrix
    tempMatrix = initMatrix(100, 0.0001, 165 * 10 ** -6);
    size = math.size(tempMatrix);

    // Heat source
    heatSliderValue = 0;
    heatSources = [];
    geometryHeatSource = new THREE.CircleGeometry(HEAT_SOURCE_RADIUS);
    materialHeatSource = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    createHeatSource(50, 50, MAX_HEAT_SOURCE_POWER);
    createHeatSource(5, 5, MAX_HEAT_SOURCE_POWER);
    createHeatSource(80, 5, 500);

    cube = null;
    delta = 0;
    nbUpdate = 0;
};
let forme = 1;
let scene = new THREE.Scene();
let camera = new THREE.OrthographicCamera(WIDTH / -2, WIDTH / 2, HEIGHT / 2, HEIGHT / -2, 1, 1000);
let raycaster = new THREE.Raycaster();
let renderer = new THREE.WebGLRenderer();
let clock = new THREE.Clock();
let mouse = new THREE.Vector2();

let stopAnimation = false;

// Ajout de trous actif
let ajouterHeatSource = false;
let ajouterTrous = false;
let dragging = false;
let target;

// Initialize temperature matrix
let tempMatrix = initMatrix(100, 0.0001, 165 * 10 ** -6);
let size = math.size(tempMatrix);

// Heat source
let heatSliderValue = 0;
let heatSources = [];
let geometryHeatSource = new THREE.CircleGeometry(HEAT_SOURCE_RADIUS);
let materialHeatSource = new THREE.MeshBasicMaterial({ color: 0xffff00 });
createHeatSource(50, 50, MAX_HEAT_SOURCE_POWER);

// Setting up threejs
let element = document.body.getElementsByClassName('three-js');
element[0].appendChild(renderer.domElement);
renderer.setSize(WIDTH, HEIGHT);
camera.position.z = 2;

let cube = null;
let delta = 0;
let nbUpdate = 0;
var update = function () {
    if (stopAnimation) return;
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
    let maxHeat = 0.8 * MAX_HEAT_SOURCE_POWER;

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
    ////////////////////////
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

    circle.i = i;
    circle.j = j;
    circle.heat = heat;

    heatSources.push(circle);

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

    let stretchX = WIDTH / size[0];
    let stretchY = HEIGHT / size[1];

    return [Math.floor(y / stretchY), Math.floor(x / stretchX)];
}

// EVENTS

document.getElementById('slider').disabled = true;
// Toggle trous
document.getElementById('trous').addEventListener('click', (e) => {
    ajouterTrous = true;
    ajouterHeatSource = false;
    document.getElementById('slider').disabled = true;
});
// Toggle heat source
document.getElementById('source').addEventListener('click', (e) => {
    ajouterHeatSource = true;
    ajouterTrous = false;
    document.getElementById('slider').disabled = false;
});
// Toggle rien
document.getElementById('rien').addEventListener('click', (e) => {
    ajouterHeatSource = false;
    ajouterTrous = false;
    document.getElementById('slider').disabled = true;
});

document.getElementById('forme').addEventListener('change', (e) => {
    forme = e.target.value;
    console.log(forme);
});

renderer.domElement.addEventListener('click', (e) => {
    let mousePos = getMatrixPosFromMousePos(e);
    if (ajouterHeatSource) {
        createHeatSource(mousePos[0], mousePos[1], (heatSliderValue * MAX_HEAT_SOURCE_POWER) / 100);
    }
});

renderer.domElement.addEventListener('mousedown', (e) => {
    dragging = true;

    //identify close heat source
    if (!ajouterHeatSource && !ajouterTrous) {
        let pos = getMatrixPosFromMousePos(e);
        let pos2 = getWorldPosFromMatrixPos(pos[0], pos[1]);
        let mousePos = new THREE.Vector2(pos2[0], pos2[1]);
        for (i = 0; i < heatSources.length; i++) {
            let heatPoint = new THREE.Vector2(heatSources[i].position.x, heatSources[i].position.y);
            if (mousePos.distanceTo(heatPoint) < HEAT_SOURCE_RADIUS) {
                target = heatSources[i];
                break;
            } else target = null;
        }
    }
});

renderer.domElement.addEventListener('mouseup', (e) => {
    document.body.style.cursor = 'auto';
    dragging = false;
});

renderer.domElement.addEventListener('mousemove', (e) => {
    if (dragging) {
        document.body.style.cursor = 'pointer';
        if (ajouterTrous) {
            createHole(e);
        } else if (!ajouterHeatSource) {
            if (target) {
                let pos = getMatrixPosFromMousePos(e);
                let pos2 = getWorldPosFromMatrixPos(pos[0], pos[1]);
                target.position.x = pos2[0] + HEAT_SOURCE_RADIUS / 2;
                target.position.y = pos2[1] - HEAT_SOURCE_RADIUS / 2;
                target.i = pos[0];
                target.j = pos[1];
            }
        }
    }
});

document.getElementById('slider').addEventListener('change', (e) => {
    heatSliderValue = e.target.value;
});
document.getElementById('slider').value = heatSliderValue;

const onPlayClicked = () => {
    stopAnimation = false;
    update();
};

const onPauseClicked = () => {
    stopAnimation = true;
};

const onRestartClicked = () => {
    onPauseClicked();
    init();
    requestAnimationFrame(update);
    onPlayClicked();
};
// Start update loop
// update();
