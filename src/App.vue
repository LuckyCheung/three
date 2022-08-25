<template>
  <div class="container" ref="container"></div>
</template>
<script setup>
// 导入three
import { ref, onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
const container = ref(null);
const url = "https://luckycheung.github.io/three/untitled_mini.glb";
onMounted(() => {
  let scene = initScene(), // 场景
    // camera = initCamera(scene), // 相机
    camera, // 相机
    renderer = initRenderer(), // 渲染器
    clock = initClock(), // 时钟
    controls, // 相机控制器
    mixer,
    actions = [];

  // 灯光
  initLight(scene);
  // 模型
  initModel(scene);
  // 坐标轴
  initAxes(scene);

  function initResize(camera, renderer) {
    window.addEventListener("resize", function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  function initRenderer() {
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.shadowMapSoft = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.gammaOuput = true;
    container.value.appendChild(renderer.domElement);
    return renderer;
  }

  function initScene() {
    const scene = new THREE.Scene();
    // scene.background = new THREE.Color(0xffffff);
    return scene;
  }

  function initCamera(scene, cameras) {
    // const camera = new THREE.PerspectiveCamera(
    //   75,
    //   window.innerWidth / window.innerHeight,
    //   1,
    //   1000
    // );
    // camera.position.set(20, 60, -40);
    // camera.lookAt(new THREE.Vector3(0, 0, 0));
    // scene.add(camera);
    const camera = cameras[0];
    return camera;
  }

  function initLight(scene) {
    // 环境光
    const ambientLight = new THREE.AmbientLight(0xffb57f, 0.5);
    scene.add(ambientLight);
    // 点光
    // const pointLight = new THREE.PointLight(0xffb57f, 1, 100);
    // pointLight.position.set(0, 20, -20);
    // pointLight.castShadow = true;
    // scene.add(pointLight);

    // const pointLight1 = new THREE.PointLight(0xffb57f, 1.5, 100);
    // pointLight1.position.set(-20, 20, -20);
    // pointLight1.castShadow = true;
    // scene.add(pointLight1);
  }

  function initClock() {
    const clock = new THREE.Clock();
    return clock;
  }

  function initAxes(scene) {
    const axes = new THREE.AxesHelper(5);
    scene.add(axes);
  }

  function initControls(camera, renderer) {
    const controls = new OrbitControls(camera, renderer.domElement);
    // 阻尼
    controls.enableDamping = true;
    controls.maxAzimuthAngle = Math.PI / 10;
    controls.minAzimuthAngle = -Math.PI / 3;
    controls.maxPolarAngle = Math.PI / 3;
    controls.minPolarAngle = Math.PI / 5;
    controls.enableZoom = false;
    controls.enablePan = false;
    return controls;
  }

  function initModel(scene) {
    // 加载器
    const loader = new GLTFLoader();
    // 压缩模型
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("https://luckycheung.github.io/three/draco_decoder.js")
    loader.setDRACOLoader(dracoLoader);
    // 加载模型
    loader.load(
      url,
      function (gltf) {
        console.log("gltf", gltf);
        scene.add(gltf.scene);
        // 初始化场景物体
        gltf.scene.traverse(function (child) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.isMesh) {
            child.material = new THREE.MeshStandardMaterial({
              color: child.material.color,
            });
          }
          if (child.isLight) {
            child.intensity = 3;
            child.distance = 100;
          }
        });
        // 初始化场景相机
        camera = initCamera(scene, gltf.cameras);
        // 相机控制器
        controls = initControls(camera, renderer);
        // 初始化动画
        actions = initAnimate(gltf);
        // 开始动画
        startAnimate();
        // 事件
        initEvent(scene, camera, actions);
        // 屏幕变化
        initResize(camera, renderer);
      },
      function (xhr) {
        console.log(parseInt((xhr.loaded / xhr.total) * 100) + "% loaded");
      }
    );
  }

  function initAnimate(gltf) {
    const actions = [];
    mixer = new THREE.AnimationMixer(gltf.scene);
    const action1 = mixer.clipAction(gltf.animations[0]);
    action1.clampWhenFinished = true;
    action1.loop = THREE.LoopOnce;
    action1.play();
    actions.push(action1);

    const action2 = mixer.clipAction(gltf.animations[1]);
    action2.clampWhenFinished = true;
    action2.loop = THREE.LoopOnce;
    // action2.play();
    actions.push(action2);
    return actions;
  }

  function startAnimate() {
    mixer.update(clock.getDelta());
    renderer.render(scene, camera);
    controls.update();
    requestAnimationFrame(startAnimate);
  }

  function initEvent(scene, camera, actions) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    window.addEventListener(
      "click",
      function (event) {
        // 通过鼠标点击的位置计算出raycaster所需要的点的位置，以屏幕中心为原点，值的范围为-1到1.
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        // 通过鼠标点的位置和当前相机的矩阵计算出raycaster
        raycaster.setFromCamera(mouse, camera);
        // 获取raycaster直线和所有模型相交的数组集合
        const intersects = raycaster.intersectObjects(scene.children);
        intersects.forEach((item, index) => {
          if (intersects[index].object.name === "conveyor") {
            actions[1].play();
          }
        });
      },
      false
    );
  }
});
</script>

<style scoped>
.container {
  width: 100vw;
  height: 100vh;
}
</style>
