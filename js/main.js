const createMenu = () => {};

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight * 0.75;

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

var testData = [
    [9, 9, 9, 9, 9],
    [99, 99, 99, 99, 99],
    [149, 149, 149, 149, 149],
    [199, 199, 199, 199, 199],
    [200, 200, 200, 200, 200],
];
var tempTexture = convertTemperatureMatrixToTexture(testData);

var scene = new THREE.Scene();
var camera = new THREE.OrthographicCamera(WIDTH / -2, WIDTH / 2, HEIGHT / 2, HEIGHT / -2, 1, 1000);
camera.position.z = 1;

var renderer = new THREE.WebGLRenderer();
renderer.setSize(WIDTH, HEIGHT);
let element = document.body.getElementsByClassName('three-js');
element[0].appendChild(renderer.domElement);
// document.body.appendChild(renderer.domElement);

createMenu();

var geometry = new THREE.BoxGeometry(WIDTH, HEIGHT, 0);
var material = new THREE.MeshBasicMaterial({
    map: tempTexture,
});
var cube = new THREE.Mesh(geometry, material);
scene.add(cube);

var animate = function () {
    requestAnimationFrame(animate);

    renderer.render(scene, camera);
};

animate();
