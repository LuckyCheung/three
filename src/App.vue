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
import url from "@/assets/untitled1.gltf?url";
const container = ref(null);
onMounted(() => {
  let scene,
    camera,
    renderer,
    clock,
    controls,
    mixer,
    gltf,
    actions = [];

  // 渲染器
  initRenderer();
  // 场景
  initScene();
  // 相机
  initCamera();
  // 灯光
  initLight();
  // 时钟
  initClock();
  // 坐标轴
  initAxes();
  // 相机控制器
  initControls();
  // 模型
  initModel();
  // 屏幕变化
  initResize();
  // 事件
  initEvent();

  function initResize() {
    window.addEventListener("resize", function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  function initRenderer() {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.gammaOuput = true;
    container.value.appendChild(renderer.domElement);
  }

  function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffb57f);
  }

  function initCamera() {
    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    camera.position.set(20, 60, -40);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    scene.add(camera);
  }

  function initLight() {
    // 环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    // 点光
    const pointLight = new THREE.PointLight(0xffb57f, 1, 100);
    pointLight.position.set(0, 20, -20);
    pointLight.castShadow = true;
    scene.add(pointLight);

    const pointLight1 = new THREE.PointLight(0xffb57f, 1.5, 100);
    pointLight1.position.set(-20, 20, -20);
    pointLight1.castShadow = true;
    scene.add(pointLight1);
  }

  function initClock() {
    clock = new THREE.Clock();
  }

  function initAxes() {
    const axes = new THREE.AxesHelper(5);
    scene.add(axes);
  }

  function initControls() {
    controls = new OrbitControls(camera, renderer.domElement);
    // 阻尼
    controls.enableDamping = true;
    // controls.maxAzimuthAngle = 1.2 * Math.PI;
    // controls.minAzimuthAngle = -1.2 * Math.PI;
    // controls.maxPolarAngle = Math.PI / 3;
    // controls.minPolarAngle = Math.PI / 5;
  }

  function initModel() {
    // 加载模型
    const loader = new GLTFLoader();
    // 解压模型
    const dracoLoader = new DRACOLoader();
    loader.setDRACOLoader(dracoLoader);
    loader.load(
      url,
      function (loaderModel) {
        gltf = loaderModel;
        gltf.scene.rotation.y = Math.PI;
        console.log(gltf, 1111);
        initAnimate();
        // 初始化场景
        gltf.scene.traverse(function (child) {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            child.material = new THREE.MeshStandardMaterial({
              color: child.material.color,
            });
            // child.material.emissive = child.material.color;
            // child.material.emissiveMap = child.material.map;
          }
          if (child.isObject3D) {
            child.castShadow = true;
          }
        });
        scene.add(gltf.scene);
        // 初始化相机
        // gltf.cameras.forEach((item) => {
        //   scene.add(item);
        // });

        // 动画
        startAnimate();
      },
      function (xhr) {
        console.log(parseInt((xhr.loaded / xhr.total) * 100) + "% loaded");
      }
    );
  }

  function initAnimate() {
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
  }

  function startAnimate() {
    mixer.update(clock.getDelta());
    renderer.render(scene, camera);
    controls.update();
    requestAnimationFrame(startAnimate);
  }

  function initEvent() {
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
