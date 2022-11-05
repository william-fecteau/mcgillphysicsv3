const FPS = 60;
const HEIGHT = window.innerHeight * 0.75;
const WIDTH = HEIGHT;

let scene = new THREE.Scene();
let camera = new THREE.OrthographicCamera(WIDTH / -2, WIDTH / 2, HEIGHT / 2, HEIGHT / -2, 1, 1000);
let raycaster = new THREE.Raycaster();
let renderer = new THREE.WebGLRenderer();
let clock = new THREE.Clock();
let mouse = new THREE.Vector2();

// Ajout de trous actif
let ajouterHeatSource = false;
let ajouterTrous = false;

// Heat source
let geometryHeatSource = new THREE.CircleGeometry(5, 32);
let materialHeatSource = new THREE.MeshBasicMaterial({ color: 0xffff00 });
let heatSource = createHeatSource();
scene.add(heatSource);

// Setting up threejs
let element = document.body.getElementsByClassName('three-js');
element[0].appendChild(renderer.domElement);
renderer.setSize(WIDTH, HEIGHT);
camera.position.z = 2;

// Initialize temperature matrix
let tempMatrix = initMatrix();

let cube = null;
let delta = 0;
let nbUpdate = 0;
var update = function () {
    requestAnimationFrame(update);
    delta += clock.getDelta();

    if (delta > 1 / FPS) {
        delta = delta % (1 / FPS);

        tempMatrix = compute(tempMatrix);
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
    if (temp < 0 || temp < 10) return [7, 42, 108];
    else if (temp < 100) return [43, 106, 224];
    else if (temp < 150) return [239, 247, 82];
    else if (temp < 200) return [247, 170, 54];
    else if (temp >= 200) return [255, 0, 0];
}

function convertTemperatureMatrixToTexture(tempMatrix) {
    var sizes = math.size(tempMatrix);
    var rows = sizes[0];
    var cols = sizes[1];

    var data = new Uint8Array(4 * rows * cols); // 4* cuz rgba

    var stride = 0;
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            var color = mapTempToColor(tempMatrix[i][j]);

            data[stride] = color[0];
            data[stride + 1] = color[1];
            data[stride + 2] = color[2];
            data[stride + 3] = 255;

            stride += 4;
        }
    }

    var texture = new THREE.DataTexture(data, rows, cols);
    texture.needsUpdate = true;
    return texture;
}

function createHeatSource() {
    var circle = new THREE.Mesh(geometryHeatSource, materialHeatSource);
    circle.position.z = 1;

    return circle;
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
    var rect = e.target.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    console.log(x, y);
});

// Start update loop
update();
