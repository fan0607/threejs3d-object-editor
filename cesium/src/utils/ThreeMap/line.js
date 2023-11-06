// 引入three.js
import * as THREE from 'three';
// pointsArrs：一个行政区包含一个或多个轮廓，一个轮廓对应pointsArrs的一个元素
function 边界线(pointsArrs) {
  var group = new THREE.Group();//一个国家多个轮廓线条line的父对象
  pointsArrs.forEach(polygon => {
    var pointArr = [];//边界线顶点坐标
    polygon[0].forEach(elem => {
      pointArr.push(elem[0], elem[1], 0);
    });
    group.add(一个封闭轮廓线条(pointArr));
  });
  return group;
}


// pointArr：行政区一个多边形轮廓边界坐标(2个元素为一组，分别表示一个顶点x、y值)
function 一个封闭轮廓线条(pointArr) {
  /**
   * 通过BufferGeometry构建一个几何体，传入顶点数据
   * 通过Line模型渲染几何体，连点成线
   * LineLoop和Line功能一样，区别在于首尾顶点相连，轮廓闭合
   */
  var geometry = new THREE.BufferGeometry(); //创建一个Buffer类型几何体对象
  //类型数组创建顶点数据
  var vertices = new Float32Array(pointArr);
  // 创建属性缓冲区对象
  var attribue = new THREE.BufferAttribute(vertices, 3); //3个为一组，表示一个顶点的xyz坐标
  // 设置几何体attributes属性的位置属性
  geometry.attributes.position = attribue;
  // 线条渲染几何体顶点数据
  var material = new THREE.LineBasicMaterial({
    color: 0x00cccc //线条颜色
  });//材质对象
  // var line = new THREE.Line(geometry, material);//线条模型对象
  var line = new THREE.LineLoop(geometry, material);//首尾顶点连线，轮廓闭合
  return line;
}

export { 边界线 };