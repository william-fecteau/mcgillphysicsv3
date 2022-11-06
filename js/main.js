const FPS = 60;
const HEIGHT = window.innerHeight * 0.75;
const WIDTH = HEIGHT;
const MAX_HEAT_SOURCE_POWER = 5000;
const HEAT_SOURCE_RADIUS = 5;

// Threejs variables
let scene = new THREE.Scene();
let camera = new THREE.OrthographicCamera(WIDTH / -2, WIDTH / 2, HEIGHT / 2, HEIGHT / -2, 1, 1000);
let renderer = new THREE.WebGLRenderer();
let cube = null;

// Time control
let delta, nbUpdate, timeElapsedMs, clock;

// State control
let forme = 1;
let isSimulationRunning = true;
let ajouterHeatSource, ajouterTrous, dragging, target;

// Temp matrix
let tempMatrix, size;

// Heat sources
let heatSliderValue = 0.5;
let heatSources;
const geometryHeatSource = new THREE.CircleGeometry(HEAT_SOURCE_RADIUS);
const materialHeatSource = new THREE.MeshBasicMaterial({ color: 0xffff00 });

// Setting up threejs
let element = document.body.getElementsByClassName('three-js-renderer');
element[0].appendChild(renderer.domElement);
renderer.setSize(WIDTH, HEIGHT);
camera.position.z = 2;

const init = () => {
    clock = new THREE.Clock();

    // Clearing the scene
    while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }

    // Set initial state
    ajouterHeatSource = false;
    ajouterTrous = false;
    dragging = false;
    target = null;
    cube = null;

    // Initialize temperature matrix
    tempMatrix = initMatrix(100, 0.0001);
    size = math.size(tempMatrix);

    // Heat sources
    heatSources = [];
    createHeatSource(50, 50, MAX_HEAT_SOURCE_POWER);

    // Time control
    delta = 0;
    nbUpdate = 0;
    timeElapsedMs = 0;
};

function render() {
    var textureResult = convertTemperatureMatrixToTexture(tempMatrix);

    if (cube != null) scene.remove(cube);

    if (path.length > 1) {
        fissure(tempMatrix);
    }

    var geometry = new THREE.BoxGeometry(WIDTH, HEIGHT, 0);
    var material = new THREE.MeshBasicMaterial({
        map: textureResult,
    });
    cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    renderer.render(scene, camera);
}

var update = function () {
    if (delta > 1 / FPS) {
        delta = delta % (1 / FPS);

        if (isSimulationRunning) {
            tempMatrix = compute(tempMatrix, heatSources);
            timeElapsedMs += deltaTime * 1000;
        }

        let temperatureAvg = computeTempMatrixAvg(tempMatrix);
        document.getElementById('simulation-info-content').innerHTML =
            'Avg temp.: ' +
            numberWithCommas(temperatureAvg.toFixed(2)) +
            ' K - Time elapsed: ' +
            numberWithCommas(timeElapsedMs.toFixed(2)) +
            ' ms';

        render();

        nbUpdate++;
    }

    requestAnimationFrame(update);
    delta += clock.getDelta();
};

function mapTempToColor(temp) {
    const gradient = [
        [0, 14, 215],
        [0, 114, 215],
        [88, 168, 255],
        [212, 255, 23],
        [244, 168, 40],
        [244, 108, 12],
        [255, 57, 10],
        [255, 20, 20],
        [245, 0, 7],
        [225, 5, 5],
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
    if (tempMatrix[pos[0]][pos[1]] != -1) {
        tempMatrix[pos[0]][pos[1]] = -1;
        unusedWeaknesses.push(pos);
    }
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

function computeTempMatrixAvg(tempMatrix) {
    let sum = 0;
    let count = 0;

    for (let i = 0; i < size[0]; i++) {
        for (let j = 0; j < size[1]; j++) {
            if (tempMatrix[i][j] >= 0) {
                sum += tempMatrix[i][j];
                count++;
            }
        }
    }

    return sum / count;
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',');
}

// EVENTS

document.getElementById('slider').disabled = true;
document.getElementById('slider-div').hidden = true;
document.getElementById('forme').value = forme;
// Toggle trous
document.getElementById('trous').addEventListener('click', (e) => {
    ajouterTrous = true;
    ajouterHeatSource = false;
    document.getElementById('slider').disabled = true;
    document.getElementById('slider-div').hidden = true;
});
// Toggle heat source
document.getElementById('source').addEventListener('click', (e) => {
    ajouterHeatSource = true;
    ajouterTrous = false;
    document.getElementById('slider').disabled = false;
    document.getElementById('slider-div').hidden = false;
});
// Toggle rien
document.getElementById('rien').addEventListener('click', (e) => {
    ajouterHeatSource = false;
    ajouterTrous = false;
    document.getElementById('slider').disabled = true;
    document.getElementById('slider-div').hidden = true;
});

document.getElementById('forme').addEventListener('change', (e) => {
    forme = e.target.value;
    onRestartClicked();
});

document.getElementById('material').addEventListener('change', (e) => {
    currentMat = materials[e.target.value];

    E = currentMat.E;
    gammaS = currentMat.gammaS;
    al = currentMat.al;
    diffusionCoefficent = currentMat.diffusionCoefficent;

    onRestartClicked();
});

renderer.domElement.addEventListener('click', (e) => {
    let mousePos = getMatrixPosFromMousePos(e);
    if (ajouterHeatSource) {
        createHeatSource(mousePos[0], mousePos[1], (heatSliderValue * MAX_HEAT_SOURCE_POWER) / 100);
    }
    if (ajouterTrous) {
        createHole(e);
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
    // document.body.style.cursor = 'auto';
    dragging = false;
});

renderer.domElement.addEventListener('dblclick', (e) => {
    if (!ajouterHeatSource && !ajouterTrous) {
        let pos = getMatrixPosFromMousePos(e);
        path = [];
        pathfinding(tempMatrix, [pos[0], pos[1]]);
    }
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
        } else {
            let mousePos = getMatrixPosFromMousePos(e);
            createHeatSource(
                mousePos[0],
                mousePos[1],
                (heatSliderValue * MAX_HEAT_SOURCE_POWER) / 100
            );
        }
    } else {
        document.body.style.cursor = 'auto';
    }
});

document.getElementById('slider').addEventListener('change', (e) => {
    heatSliderValue = Number(e.target.value);
});
document.getElementById('slider').value = heatSliderValue;

const onPlayPauseClicked = () => {
    isSimulationRunning = !isSimulationRunning;
    setPlayPauseIcon();
    if (isSimulationRunning) update();
};

const setPlayPauseIcon = () => {
    let icon = './assets/pause.svg';
    if (!isSimulationRunning) {
        icon = './assets/play.svg';
    }
    document.getElementById('play-pause').src = icon;
};

const onRestartClicked = () => {
    init();
    setPlayPauseIcon();
};

// Start update loop
init();
update();
