const createMenu = () => {};

const FPS = 60;
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight * 0.75;

var raycaster = new THREE.Raycaster();

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

var scene = new THREE.Scene();
var camera = new THREE.OrthographicCamera(WIDTH / -2, WIDTH / 2, HEIGHT / 2, HEIGHT / -2, 1, 1000);
camera.position.z = 2;

var renderer = new THREE.WebGLRenderer();
renderer.setSize(WIDTH, HEIGHT);
let element = document.body.getElementsByClassName('three-js');
element[0].appendChild(renderer.domElement);
// document.body.appendChild(renderer.domElement);

createMenu();

var cube = null;

const geometryCircle = new THREE.CircleGeometry(5, 32);
const materialCircle = new THREE.MeshBasicMaterial({ color: 0xffff00 });
var circle = new THREE.Mesh(geometryCircle, materialCircle);
circle.position.z = 1;
scene.add(circle);

let clock = new THREE.Clock();
let delta = 0;
let interval = 1 / FPS;
let nbUpdate = 0;
let tempMatrix = initMatrix();
var update = function () {
    requestAnimationFrame(update);
    delta += clock.getDelta();

    if (delta > interval) {
        delta = delta % interval;
        nbUpdate++;

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
        // console.log(nbUpdate);
        // console.log(tempMatrix);
    }
};

update();

var mouse = new THREE.Vector2();
document.body.addEventListener('click', (event) => {
    mouse.x = (event.clientX / WIDTH) * 2 - 1;
    mouse.y = -(event.clientY / HEIGHT) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    circle.position.x = mouse.x;
    circle.position.y = mouse.y;

    console.log(mouse);
});
