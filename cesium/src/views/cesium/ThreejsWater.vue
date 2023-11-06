<template>
  <div ref="cesiumContainer"></div>
</template>

<script setup>
window.CESIUM_BASE_URL = "/";
import { onMounted, ref } from "vue";
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
const cesiumContainer = ref(null);

onMounted(() => {
  Cesium.Ion.defaultAccessToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3ZmQxNDc1MS05ZGYwLTQyMDktYjVlOS02MzQ0ZGJkNzkxZDEiLCJpZCI6MTIwOTE1LCJpYXQiOjE2NzMzNTY4NjF9.IJXioTp0FvkLeyEsrCPt1Fql0iZzS3GpeFXRacToz_Y";
  init();
});
async function init() {
  const viewer = new Cesium.Viewer(cesiumContainer.value, {
    //   useDefaultRenderLoop: false,
    selectionIndicator: false,
    homeButton: false,
    sceneModePicker: false,
    navigationHelpButton: false,
    infoBox: false,
    navigationHelpButton: false,
    navigationInstructionsInitiallyVisible: false,
    animation: false,
    timeline: false,
    fullscreenButton: false,
    allowTextureFilterAnisotropic: false,
    contextOptions: {
      // requestWebgl1: true,
      /* webgl: {
        alpha: false,
        antialias: true,
        preserveDrawingBuffer: true,
        failIfMajorPerformanceCaveat: false,
        depth: true,
        stencil: false,
        anialias: false,
      }, */
    },
    targetFrameRate: 60,
    resolutionScale: 0.1,
    orderIndependentTranslucency: true,
    imageryProvider: new Cesium.WebMapTileServiceImageryProvider({
      url: "http://t0.tianditu.gov.cn/img_w/wmts?tk=e034011fa32a63ed6f23d6782590f00b", // 这是天地图卫星图层URL的示例，确保你有正确的URL
      layer: "tdtBasicLayer",
      style: "default",
      format: "image/jpeg",
      tileMatrixSetID: "GoogleMapsCompatible",
      show: true,
    }),
    baseLayerPicker: true,
    geocoder: false,
    automaticallyTrackDataSourceClocks: false,
    dataSources: null,
    clock: null,
    terrainShadows: Cesium.ShadowMode.DISABLED,
  });
  // viewer.scene.globe.depthTestAgainstTerrain = true; //开启深度检测

    viewer.scene.setTerrain(
      new Cesium.Terrain(Cesium.CesiumTerrainProvider.fromIonAssetId(1))
    );
    const tilesetBuildings = viewer.scene.primitives.add(
      await Cesium.Cesium3DTileset.fromIonAssetId(75343)
    );
    const center = {
      x: 121.466139,
      y: 31.257341,
      z: 0,
    };
    waterWebGL2(viewer, center)

}
function waterWebGL2(viewer, center){
  const instance = new Cesium.GeometryInstance({
    geometry: new Cesium.RectangleGeometry({
      rectangle: Cesium.Rectangle.fromDegrees(-95.0, 50.0, -90.0, 55),
      vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
    }),
  });


 
  /* let inst = new Cesium.GeometryInstance({
    geometry: geometry
  }); */
 
  // 自定义材质
  let aper = new Cesium.MaterialAppearance({
    material: new Cesium.Material({
      fabric: {
        uniforms: {
          iTime: 0,
        },
        source:`
        const int NUM_STEPS = 8;
        const float PI     = 3.141592;
        const float EPSILON  = 1e-3;
        //#define EPSILON_NRM (0.1 / iResolution.x)
        #define EPSILON_NRM (0.1 / 200.0)
        // sea
        const int ITER_GEOMETRY = 3;
        const int ITER_FRAGMENT = 5;
        const float SEA_HEIGHT = 0.6;
        const float SEA_CHOPPY = 4.0;
        const float SEA_SPEED = 1.8;
        const float SEA_FREQ = 0.16;
        const vec3 SEA_BASE = vec3(0.1,0.19,0.22);
        const vec3 SEA_WATER_COLOR = vec3(0.8,0.9,0.6);
        //#define SEA_TIME (1.0 + iTime * SEA_SPEED)
        const mat2 octave_m = mat2(1.6,1.2,-1.2,1.6);
        // math
        mat3 fromEuler(vec3 ang) {
          vec2 a1 = vec2(sin(ang.x),cos(ang.x));
          vec2 a2 = vec2(sin(ang.y),cos(ang.y));
          vec2 a3 = vec2(sin(ang.z),cos(ang.z));
          mat3 m;
          m[0] = vec3(a1.y*a3.y+a1.x*a2.x*a3.x,a1.y*a2.x*a3.x+a3.y*a1.x,-a2.y*a3.x);
          m[1] = vec3(-a2.y*a1.x,a1.y*a2.y,a2.x);
          m[2] = vec3(a3.y*a1.x*a2.x+a1.y*a3.x,a1.x*a3.x-a1.y*a3.y*a2.x,a2.y*a3.y);
          return m;
        }
        float hash( vec2 p ) {
          float h = dot(p,vec2(127.1,311.7));
          return fract(sin(h)*43758.5453123);
        }
        float noise( in vec2 p ) {
          vec2 i = floor( p );
          vec2 f = fract( p );
          vec2 u = f*f*(3.0-2.0*f);
          return -1.0+2.0*mix( mix( hash( i + vec2(0.0,0.0) ),
                  hash( i + vec2(1.0,0.0) ), u.x),
                mix( hash( i + vec2(0.0,1.0) ),
                  hash( i + vec2(1.0,1.0) ), u.x), u.y);
        }
        // lighting
        float diffuse(vec3 n,vec3 l,float p) {
          return pow(dot(n,l) * 0.4 + 0.6,p);
        }
        float specular(vec3 n,vec3 l,vec3 e,float s) {
          float nrm = (s + 8.0) / (PI * 8.0);
          return pow(max(dot(reflect(e,n),l),0.0),s) * nrm;
        }
        // sky
        vec3 getSkyColor(vec3 e) {
          e.y = max(e.y,0.0);
          return vec3(pow(1.0-e.y,2.0), 1.0-e.y, 0.6+(1.0-e.y)*0.4);
        }
        // sea
        float sea_octave(vec2 uv, float choppy) {
          uv += noise(uv);
          vec2 wv = 1.0-abs(sin(uv));
          vec2 swv = abs(cos(uv));
          wv = mix(wv,swv,wv);
          return pow(1.0-pow(wv.x * wv.y,0.65),choppy);
        }
        float map(vec3 p) {
          float freq = SEA_FREQ;
          float amp = SEA_HEIGHT;
          float choppy = SEA_CHOPPY;
          vec2 uv = p.xz; uv.x *= 0.75;
          float d, h = 0.0;
          float SEA_TIME = 1.0 + iTime * SEA_SPEED;
          for(int i = 0; i < ITER_GEOMETRY; i++) {
            d = sea_octave((uv+SEA_TIME)*freq,choppy);
            d += sea_octave((uv-SEA_TIME)*freq,choppy);
            h += d * amp;
            uv *= octave_m; freq *= 1.9; amp *= 0.22;
            choppy = mix(choppy,1.0,0.2);
          }
          return p.y - h;
        }
        float map_detailed(vec3 p) {
          float freq = SEA_FREQ;
          float amp = SEA_HEIGHT;
          float choppy = SEA_CHOPPY;
          vec2 uv = p.xz; uv.x *= 0.75;
          float SEA_TIME = 1.0 + iTime * SEA_SPEED;
          float d, h = 0.0;
          for(int i = 0; i < ITER_FRAGMENT; i++) {
            d = sea_octave((uv+SEA_TIME)*freq,choppy);
            d += sea_octave((uv-SEA_TIME)*freq,choppy);
            h += d * amp;
            uv *= octave_m; freq *= 1.9; amp *= 0.22;
            choppy = mix(choppy,1.0,0.2);
          }
          return p.y - h;
        }
        vec3 getSeaColor(vec3 p, vec3 n, vec3 l, vec3 eye, vec3 dist) {
          float fresnel = clamp(1.0 - dot(n,-eye), 0.0, 1.0);
          fresnel = pow(fresnel,3.0) * 0.65;
          vec3 reflected = getSkyColor(reflect(eye,n));
          vec3 refracted = SEA_BASE + diffuse(n,l,80.0) * SEA_WATER_COLOR * 0.12;
          vec3 color = mix(refracted,reflected,fresnel);
          float atten = max(1.0 - dot(dist,dist) * 0.001, 0.0);
          color += SEA_WATER_COLOR * (p.y - SEA_HEIGHT) * 0.18 * atten;
          color += vec3(specular(n,l,eye,60.0));
          return color;
        }
        // tracing
        vec3 getNormal(vec3 p, float eps) {
          vec3 n;
          n.y = map_detailed(p);
          n.x = map_detailed(vec3(p.x+eps,p.y,p.z)) - n.y;
          n.z = map_detailed(vec3(p.x,p.y,p.z+eps)) - n.y;
          n.y = eps;
          return normalize(n);
        }
        float heightMapTracing(vec3 ori, vec3 dir, out vec3 p) {
          float tm = 0.0;
          float tx = 1000.0;
          float hx = map(ori + dir * tx);
          if(hx > 0.0) return tx;
          float hm = map(ori + dir * tm);
          float tmid = 0.0;
          for(int i = 0; i < NUM_STEPS; i++) {
            tmid = mix(tm,tx, hm/(hm-hx));
            p = ori + dir * tmid;
            float hmid = map(p);
            if(hmid < 0.0) {
              tx = tmid;
              hx = hmid;
            } else {
              tm = tmid;
              hm = hmid;
            }
          }
          return tmid;
        }
            vec4 czm_getMaterial(vec2 vUv)
            {
              vec2 uv = vUv;
              uv = vUv * 2.0 - 1.0;
              float time = iTime * 0.3 + 0.0*0.01;
              // ray
              vec3 ang = vec3(0, 1.2, 0.0);
                vec3 ori = vec3(0.0,3.5,0);
              vec3 dir = normalize(vec3(uv.xy,-2.0)); dir.z += length(uv) * 0.15;
              dir = normalize(dir) * fromEuler(ang);
              // tracing
              vec3 p;
              heightMapTracing(ori,dir,p);
              vec3 dist = p - ori;
              vec3 n = getNormal(p, dot(dist,dist) * EPSILON_NRM);
              vec3 light = normalize(vec3(0.0,1.0,0.8));
              // color
              vec3 color = mix(
                getSkyColor(dir),
                getSeaColor(p,n,light,dir,dist),
                pow(smoothstep(0.0,-0.05,dir.y),0.3));
                return vec4( pow(color,vec3(0.75)), 1.0 );
            }
          `,
      }
    }),
    translucent: true,
    vertexShaderSource: `
        in vec3 position3DHigh;
        in vec3 position3DLow;
        in float batchId;
        in vec2 st;
        in vec3 normal;
        out vec2 v_st;
        out vec3 v_positionEC;
        out vec3 v_normalEC;
        void main() {
            v_st = st;
            vec4 p = czm_computePosition();
            v_positionEC = (czm_modelViewRelativeToEye * p).xyz;      // position in eye coordinates
            v_normalEC = czm_normal * normal;                         // normal in eye coordinates
            gl_Position = czm_modelViewProjectionRelativeToEye * p;
        }
                    `,
    fragmentShaderSource: `
      in vec2 v_st;
      in vec3 v_positionEC;
      in vec3 v_normalEC;
      void main()  {
        vec3 positionToEyeEC = -v_positionEC;
        vec3 normalEC = normalize(v_normalEC);
        czm_materialInput materialInput;
        materialInput.normalEC = normalEC;
        materialInput.positionToEyeEC = positionToEyeEC;
        materialInput.st = v_st;
        vec4 color = czm_getMaterial(v_st);
        out_FragColor = color;
      }
                `,
  });
 
  let modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
          Cesium.Cartesian3.fromDegrees(110, 40, 10)
  );
  viewer.scene.primitives.add(
    new Cesium.Primitive({
      geometryInstances: instance,
      asynchronous: false,
      appearance: aper,
      // modelMatrix: modelMatrix,
    })
  );
  viewer.camera.flyToBoundingSphere(
    new Cesium.BoundingSphere(
      Cesium.Cartesian3.fromDegrees(-95.0, 25.0, 10.0),
      950000.0
    )
  );
  /* viewer.scene.primitives.add(new Cesium.Primitive({
    geometryInstances: inst,
    asynchronous: false,
    appearance: aper,
    modelMatrix: modelMatrix,
  })); */
  /* viewer.camera.flyToBoundingSphere(new Cesium.BoundingSphere(
          Cesium.Cartesian3.fromDegrees(110, 40, 10), 950000,
  ),{
    duration: 0.1,
  }); */
  function renderLoop(timestamp){
    aper.material.uniforms.iTime = timestamp/1000;
    requestAnimationFrame(renderLoop);
  }
  renderLoop()
}
</script>
<style scoped></style>
