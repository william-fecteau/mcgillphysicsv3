const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const loader = new THREE.TextureLoader();
const texture = loader.load('assets/monke.jpg');

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
