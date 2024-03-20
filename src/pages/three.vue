<template>
  <div id="three"></div>
  <Popover
    ref="popoverRef"
    :top="popoverTop"
    :left="popoverLeft"
    :data="popoverData"
  ></Popover>
</template>

<script lang="ts" setup name="Sence">
/* eslint-disable */
import { ref, onMounted, type Ref } from "vue";
import Viewer, { type Animate } from "@/ThreeModules/Viewer";
import Floors from "@/ThreeModules/Floors";
import ModelLoader from "@/ThreeModules/ModelLoder";
import * as THREE from "three";
import gsap from "gsap";
import Event from "@/ThreeModules/Viewer/Events";
import BoxHelperWrap from "@/ThreeModules/BoxHelperWrap";
import { checkNameIncludes, findParent } from "@/utils";

// import Popover from "./Popover/index.vue";

let viewer: Viewer;
let modelLoader: ModelLoader;
let boxHelperWrap: BoxHelperWrap;

const popoverRef: Ref = ref(null);
const popoverTop = ref(0);
const popoverLeft = ref(0);
const popoverData = ref<any>({});

let office: any = null;
let oldOffice: any = null;
let dataCenter: any = null;
let oldDataCenter: any = null;
let modelSelect = ["zuo0", "zuo1", "zuo2", "zuo3", "zuo4", "zuo5"];
let modelSelectName = "";
let modelMoveName = "";
let isModelSelectName = false;

onMounted(() => {
  console.log("three-mounted");
  init();
  initModel();

  viewer.scene.traverse((item: THREE.Object3D) => {
    console.log(item, "0000000000");
  });
});

const init = () => {
  viewer = new Viewer("three");
  // viewer.addAxis();
  // viewer.addStats();
  viewer.initRaycaster();

  modelLoader = new ModelLoader(viewer);
  // const floors = new Floors(viewer);
  // floors.addGird();

  boxHelperWrap = new BoxHelperWrap(viewer);

  viewer.emitter.$on(Event.dblclick.raycaster, (list: THREE.Intersection[]) => {
    onMouseClick(list);
  });

  viewer.emitter.$on(
    Event.mousemove.raycaster,
    (list: THREE.Intersection[]) => {
      onMouseMove(list, "簇");
      // onMouseMove(list, "电池模组");
      onMouseMove(list, "空调");
      onMouseMove(list, "摄像头");
    }
  );
};

const initModel = () => {
  modelLoader.loadModelToScene("/models/stationOpen.glb", (baseModel) => {
    console.log(baseModel, "1111111");
    baseModel.setScalc(0.2);
    // baseModel.object.rotation.y = Math.PI / 2;
    const model = baseModel.gltf.scene;
    model.position.set(0, 0, 0);
    model.name = "电池舱";
    baseModel.openCastShadow();

    dataCenter = baseModel;
    oldDataCenter = model.clone();

    const rackList: any[] = [];
    model.traverse((item: any) => {
      if (checkIsRack(item, "簇")) {
        rackList.push(item);
      }
      if (checkIsRack(item, "空调")) {
        rackList.push(item);
      }
      if (checkIsRack(item, "摄像头")) {
        rackList.push(item);
      }
      if (checkIsRack(item, "电池模组")) {
        rackList.push(item);
      }
    });
    // console.log(rackList, 'rackList------');

    viewer.setRaycasterObjects(rackList);
  });
};

const onMouseClick = (intersects: THREE.Intersection[]) => {
  if (!intersects.length) return;
  const selectedObject = intersects[0].object;
  let selectedObjectName = "";
  const findClickModel = (object: any) => {
    console.log(object, "object");
    if (object.type === "Group") {
      selectedObjectName = object.name;
    }
    if (object.parent && object.type !== "Scene") {
      findClickModel(object.parent);
    }
  };
  findClickModel(selectedObject);
  // const selectedModel = viewer.scene.getObjectByName(selectedObjectName);
  console.log(selectedObject, "selectedObject",intersects,'intersects');
  // if (selectedObject.name.includes("zuo")) {
  //   selectOffice(selectedObject.parent);
  // }
  // // 点击其他区域
  // if (!selectedObject.name.includes("zuo")) {
  //   if (!isModelSelectName && oldOffice) {
  //     let oldmodel = oldOffice.getObjectByName(modelMoveName);
  //     office.object
  //       .getObjectByName(modelMoveName)
  //       .traverse(function (child: { isMesh: any; material: any; name: any }) {
  //         if (child.isMesh) {
  //           child.material = oldmodel.getObjectByName(child.name).material;
  //         }
  //       });
  //   }
  // }
};

// function checkIsRack (obj: any): boolean {
//   return checkNameIncludes(obj, '簇');
// }
function checkIsRack(obj: any, keyword: string): boolean {
  return checkNameIncludes(obj, keyword);
}
const onMouseMove = (intersects: THREE.Intersection[], keyword: string) => {
  if (!intersects.length) {
    popoverRef.value.setShow(false);
    boxHelperWrap.setVisible(false);
    return;
  }
  const selectedObject = intersects[0].object || {};
  let selectedObjectName = "";
  // 修改 findClickModel 函数，使其接受关键字参数
  const findClickModel = (object: any, keyword: string) => {
    if (object.name.includes(keyword)) {
      selectedObjectName = object.name;
      return;
    }
    if (object.parent) {
      findClickModel(object.parent, keyword);
    }
  };
  findClickModel(selectedObject, keyword);
  const rack = findParent(
    selectedObject,
    (obj: any, keyword: string) => checkIsRack(obj, keyword),
    keyword
  );
  if (rack) {
    boxHelperWrap.attach(rack);
    updateRackInfo(rack.name);
  }
};

const updateRackInfo = (name: string) => {
  if (name) {
    popoverRef.value.setShow(true, { name });
    const event = viewer.mouseEvent as MouseEvent;
    popoverTop.value = event.y + 10;
    popoverLeft.value = event.x + 10;
  } else {
    popoverRef.value.setShow(false);
  }
};

const selectOffice = (model: any) => {
  modelSelectName = model.name;
  let oldmodel = oldOffice.getObjectByName(modelSelectName);
  let modelSelectIndex = modelSelect.findIndex((v) => v === modelSelectName);
  office.object.children.forEach((child: any, index: number) => {
    child.children.forEach((Mesh: any) => {
      if (child.name === modelSelectName) {
        child.children.forEach((Mesh: { material: any; name: any }) => {
          Mesh.material = oldmodel.getObjectByName(Mesh.name).material;
        });
      } else {
        // Mesh.material = new THREE.MeshPhongMaterial({
        //   color: new THREE.Color('#123ca8'),
        //   transparent: true,
        //   opacity: 0.5,
        //   emissiveMap: Mesh.material.map,
        // });
      }
    });
    if (!model.userData.position && index > modelSelectIndex) {
      gsap.to(child.position, {
        y: !child.userData.position ? child.position.y + 60 : child.position.y,
        duration: 2,
        ease: "power1.inOut",
        onComplete: () => {
          child.userData.position = true;
        },
      });
    }
    if (model.userData.position && index <= modelSelectIndex) {
      if (child.userData.position) {
        gsap.to(child.position, {
          y: oldOffice.getObjectByName(child.name).position.y,
          duration: 2,
          ease: "power1.inOut",
          onComplete: () => {
            child.userData.position = false;
          },
        });
      }
    }
  });
};
</script>

<style scoped>
#three {
  height: 100%;
  width: 100%;
}
</style>
