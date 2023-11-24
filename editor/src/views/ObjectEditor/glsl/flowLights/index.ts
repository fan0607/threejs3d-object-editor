import * as THREE from "three";
import vertexShader from "./vertexShader.glsl?raw";
import fragmentShader from "./fragmentShader.glsl?raw";
/**
 * 创建流体墙体材质
 * option =>
 * params bgUrl flowUrl
 * **/
export const createFlowWallMat = ({ bgUrl, flowUrl }:{bgUrl:string,flowUrl:string}) => {
  const bgTexture = new THREE.TextureLoader().load(
    bgUrl
  );
  const flowTexture = new THREE.TextureLoader().load(
    flowUrl
  );
  // 允许平铺
  flowTexture.wrapS = THREE.RepeatWrapping;
  return new THREE.ShaderMaterial({
    uniforms: {
      time: {
        value: 0,
      },
      flowTexture: {
        value: flowTexture, 
      },
      bgTexture: {
        value: bgTexture,
      },
    },
    transparent: true,
    depthWrite: false,
    depthTest: true,
    //遮挡剔除
    side: THREE.DoubleSide,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
  });
};
/**
 * 通过path构建墙体
 * option =>
 * params height path material expand(是否需要扩展路径)
 * **/
export const creatWallByPath = ({
    height = 10,
    path = [],
    material,
    expand = true,
  }:{
    height?:number,
    path?:number[][],
    material?:THREE.Material,
    expand?:boolean
  }
  ) => {
    let verticesByTwo:any = null;
    // 1.处理路径数据  每两个顶点为为一组
    if (expand) {
      // 1.1向y方向拉伸顶点
      verticesByTwo = path.reduce((arr:any[], [x, y, z]) => {
        const arr1 = [x, y, z];
        const arr2 = [x, y + height, z];
        return arr.concat([[arr1, arr2]]);
      }, []);
    } else {
      // 1.2 已经处理好路径数据
      verticesByTwo = path;
    }
    // 2.解析需要渲染的四边形 每4个顶点为一组
    const verticesByFour = verticesByTwo.reduce((arr:any, item:any, i:any) => {
      if (i === verticesByTwo.length - 1) return arr;
      return arr.concat([[item, verticesByTwo[i + 1]]]);
    }, []);
    // 3.将四边形面转换为需要渲染的三顶点面
    const verticesByThree = verticesByFour.reduce((arr:any, item:any) => {
      const [[point1, point2], [point3, point4]] = item;
      return arr.concat(
        ...point2,
        ...point1,
        ...point4,
        ...point1,
        ...point3,
        ...point4
      );
    }, []);
    const geometry = new THREE.BufferGeometry();
    // 4. 设置position
    const vertices = new Float32Array(verticesByThree);
    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    // 5. 设置uv 6个点为一个周期 [0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1]
  
    // 5.1 以18个顶点为单位分组
    const pointsGroupBy18 = new Array(verticesByThree.length / 3 / 6)
      .fill(0)
      .map((item, i) => {
        return verticesByThree.slice(i * 3 * 6, (i + 1) * 3 * 6);
      });
    // 5.2 按uv周期分组
    const pointsGroupBy63 = pointsGroupBy18.map((item, i) => {
      return new Array(item.length / 3)
        .fill(0)
        .map((it, i) => item.slice(i * 3, (i + 1) * 3));
    });
    // 5.3根据BoundingBox确定uv平铺范围
    geometry.computeBoundingBox();
    if(!geometry.boundingBox) throw new Error('geometry.boundingBox is null')
    const { min, max } = geometry.boundingBox;
    const rangeX = max.x - min.x;
    const array = new Array()
    const uvs = array.concat(
      ...pointsGroupBy63.map((item) => {
        const point0 = item[0];
        const point5 = item[5];
        const distance =
          new THREE.Vector3(...point0).distanceTo(new THREE.Vector3(...point5)) /
          (rangeX / 10);
        return [0, 1, 0, 0, distance, 1, 0, 0, distance, 0, distance, 1];
      })
    );
    geometry.setAttribute(
      "uv",
      new THREE.BufferAttribute(new Float32Array(uvs), 2)
    );
    // 更新法线
    // geometry.computeVertexNormals();
    const meshMat =
      material ||
      new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        side: THREE.DoubleSide,
      });
    return new THREE.Mesh(geometry, meshMat);
  };
  
