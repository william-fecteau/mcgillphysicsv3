const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const loader = new THREE.TextureLoader();
const texture = loader.load('assets/monke.jpg');

//constants Texture
const TEXTURE_WIDTH = 512;
const TEXTURE_HEIGHT = 512;
const TEXTURE_SIZE = TEXTURE_WIDTH * TEXTURE_HEIGHT;
var r, g, b;

//find color
function colorMap(i) {
    if (i === 1) {
        r = 33;
        g = 150;
        b = 243;
    }
    if (i === 2) {
        r = 76;
        g = 175;
        b = 80;
    }
    if (i === 3) {
        r = 255;
        g = 235;
        b = 59;
    }
    if (i === 4) {
        r = 211;
        g = 47;
        b = 47;
    }
}
//apply color
function applyColor() {
    for (let i = 0; i < TEXTURE_SIZE; i++) {
        colorMap(i);

        var stride = i * 4;
        data[stride] = r;
        data[stride + 1] = g;
        data[stride + 2] = b;
        data[stride + 3] = 255;
    }
}

var maptexture = new THREE.DataTexture(data, width, height);

var scene = new THREE.Scene();
var camera = new THREE.OrthographicCamera(WIDTH / -2, WIDTH / 2, HEIGHT / 2, HEIGHT / -2, 1, 1000);
camera.position.z = 1;

var renderer = new THREE.WebGLRenderer();
renderer.setSize(WIDTH, HEIGHT);
document.body.appendChild(renderer.domElement);

var geometry = new THREE.BoxGeometry(WIDTH, HEIGHT, 0);
var material = new THREE.MeshBasicMaterial({
    map: texture,
});
var cube = new THREE.Mesh(geometry, material);
scene.add(cube);

var animate = function () {
    requestAnimationFrame(animate);

    renderer.render(scene, camera);
};

animate();
