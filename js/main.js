const createMenu = () => {};

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight * 0.75;

var scene = new THREE.Scene();
var camera = new THREE.OrthographicCamera(WIDTH / -2, WIDTH / 2, HEIGHT / 2, HEIGHT / -2, 1, 1000);
camera.position.z = 1;

var renderer = new THREE.WebGLRenderer();
renderer.setSize(WIDTH, HEIGHT);
let element = document.body.getElementsByClassName('three-js');
console.log(element);
element[0].appendChild(renderer.domElement);
// document.body.appendChild(renderer.domElement);

createMenu();

var geometry = new THREE.BoxGeometry(100, 100, 0);
var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
var cube = new THREE.Mesh(geometry, material);
scene.add(cube);

var animate = function () {
    requestAnimationFrame(animate);

    renderer.render(scene, camera);
};

animate();
