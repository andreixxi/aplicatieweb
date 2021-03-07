import * as THREE from './three.js/build/three.module.js';

import Stats from './three.js/examples/jsm/libs/stats.module.js';

import { OrbitControls } from './three.js/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from './three.js/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from './three.js/examples/jsm/loaders/DRACOLoader.js';

let mixer;

const clock = new THREE.Clock();
const container = document.getElementById('section1');

const stats = new Stats();
container.appendChild(stats.dom);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbfe3dd);

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 100);
camera.position.set(5, 2, 8);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.5, 0);
controls.update();
controls.enablePan = false;
controls.enableDamping = true;

scene.add(new THREE.HemisphereLight(0xffffff, 0x000000, 0.4));

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 2, 8);
scene.add(dirLight);

// envmap
const path = 'three.js/examples/textures/cube/Park2/';
const format = '.jpg';
const envMap = new THREE.CubeTextureLoader().load([
    path + 'posx' + format, path + 'negx' + format,
    path + 'posy' + format, path + 'negy' + format,
    path + 'posz' + format, path + 'negz' + format
]);

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('js/libs/draco/gltf/');

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);
loader.load('character3D/test_2.glb', function (gltf) {

    const model = gltf.scene;
    model.position.set(1, 1, 0);
    //	model.scale.set( 0.01, 0.01, 0.01 );
    model.traverse(function (child) {

        if (child.isMesh) child.material.envMap = envMap;

    });

    scene.add(model);

    mixer = new THREE.AnimationMixer(model);
    //mixer.clipAction( gltf.animations[ 0 ] ).play();

    animate();

}, undefined, function (e) {

    console.error(e);

});


window.onresize = function () {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

};


function animate() {

    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    mixer.update(delta);

    controls.update();

    stats.update();

    renderer.render(scene, camera);

}