
window.addEventListener("click", onRay);
//need:camera,canvas,map
// 全局对象
let lastPick = null;
export function onRay(event) {
  let pickPosition = setPickPosition(event);
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(pickPosition, camera);
  // 计算物体和射线的交点
  const intersects = raycaster.intersectObjects([map], true);
  // 数组大于0 表示有相交对象
  if (intersects.length > 0) {
    if (lastPick) {
      if (lastPick.object.properties !== intersects[0].object.properties) {
        lastPick.object.material.color.set("yellow");
        lastPick = null;
      }
    }
    if (intersects[0].object.properties) {
      intersects[0].object.material.color.set("blue");
    }
    lastPick = intersects[0];
  } else {
    if (lastPick) {
      // 复原
      if (lastPick.object.properties) {
        lastPick.object.material.color.set("yellow");
        lastPick = null;
      }
    }
  }
}

/**
 * 获取鼠标在three.js 中归一化坐标
 * */
function setPickPosition(event) {
  let pickPosition = { x: 0, y: 0 };
  // 计算后 以画布 开始为 （0，0）点
  const pos = getCanvasRelativePosition(event);
  // 数据归一化
  pickPosition.x = (pos.x / canvas.width) * 2 - 1;
  pickPosition.y = (pos.y / canvas.height) * -2 + 1;
  return pickPosition;
}

// 计算 以画布 开始为（0，0）点 的鼠标坐标
function getCanvasRelativePosition(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) * canvas.width) / rect.width,
    y: ((event.clientY - rect.top) * canvas.height) / rect.height,
  };
}