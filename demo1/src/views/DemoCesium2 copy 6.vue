<template>
    <div id="monomerization1Container">
      <div class="btn">
        <el-button type="success" @click="loadMonomerization1">加载单体</el-button>
      </div>
    </div>
  </template>
  <script>
  
  let url = "http://localhost:8090/xxxx/tileset.json";
  let tileset = undefined;
  import * as Cesium from 'cesium'
  
//   import Bubble from '../assets/Bubble'
  
  let currentObjectId;
  let currentPrimitive;
  let currentColor;
  let currentShow;
  let attributes;
  
  
  let labelEntity = undefined;
  let lineEntity = undefined;
  let pointEntity = undefined;
  
  export default {
    data() {
      return {
  
      }
    },
    mounted() {
      //this.add3DTileset();
  
      this.$bus.$on('destroyedLabelEntity', (data) => {
        //console.log('我是layerload组件，destroyed收到了数据', data);
        if (data) {
          if (labelEntity && lineEntity && pointEntity) {
            // window.viewer.entities.remove(labelEntity);
            // window.viewer.entities.remove(lineEntity);
            // window.viewer.entities.remove(pointEntity);
            window.viewer.entities.removeAll()
            labelEntity = undefined;
            lineEntity = undefined;
            pointEntity = undefined;
          }
        }
      })
    },
    computed: {
  
    },
    methods: {
      loadMonomerization1() {
        console.log("222");
        this.testLoadGeoJson();
        this.leftDownAction();
      },
      add3DTileset() {
        window.viewer.scene.globe.depthTestAgainstTerrain = true;
        let _this = this;
        if (url && !tileset) {
          //深度测试
          window.viewer.scene.globe.depthTestAgainstTerrain = true;
          let src_tileset = new Cesium.Cesium3DTileset({
            //url: Cesium.IonResource.fromAssetId(44611),
            url: url,
            show: true,//是否显示
            //modelMatrix://模型矩阵，用来做平移，旋转，缩放
            //clippingPlanes://剖切面
            backFaceCulling: true//背面绘制
          });
          window.viewer.scene.primitives.add(src_tileset).readyPromise.then((tileset) => {
            // Position tileset
            let heightOffset = -115.58341466375748;
            //包围球
            var boundingSphere = tileset.boundingSphere;
            //console.log("boundingSphere", boundingSphere);
            var cartographic = Cesium.Cartographic.fromCartesian(boundingSphere.center);
            var surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0.0);
            console.log("cartographic111", cartographic);
            var offset = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, heightOffset);
            var translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
            tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
            window.viewer.zoomTo(tileset);
            tree.tileset = src_tileset;
  
            _this.renderSlm();
            _this.initPick();
          })
        }
        else if (tileset) {
          window.viewer.scene.primitives.remove(tree.tileset);
          tileset = undefined;
        }
      },
      leftDownAction() {
        const handler = new Cesium.ScreenSpaceEventHandler(window.viewer.scene.canvas);
        let _this = this
        handler.setInputAction(function (movement) {
          window.viewer.entities.removeAll();
          labelEntity = undefined;
          lineEntity = undefined;
          pointEntity = undefined;
          let pickedObject = window.viewer.scene.pick(movement.position);
          if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id)) {
  
            var ellipsoid = window.viewer.scene.globe.ellipsoid;
            var cartographic = ellipsoid.cartesianToCartographic(pickedObject.primitive.position);
            //取样高程函数，获取3dtiles的实际搞城
            let sampleHeight = viewer.scene.sampleHeight(cartographic);
  
            var longitude = Cesium.Math.toDegrees(cartographic.longitude);
            var latitude = Cesium.Math.toDegrees(cartographic.latitude);
  
            //生成弹窗的高程点sampleHeight + 10
            var cartographic = Cesium.Cartographic.fromDegrees(longitude, latitude, sampleHeight + 5);
            var polyCenter = ellipsoid.cartographicToCartesian(cartographic);
  
            //重新把笛卡尔世界坐标值赋值给对象
            pickedObject.primitive.position = polyCenter;
            // _this.bubble(pickedObject)
  
            // let imageUrl = require("../../assets/images/tools/billboard.png");
            let imageUrl = require("../../assets/images/tools/billboard.png");
            //生成label的高程点sampleHeight + 5
            _this.poiIconLabelAdd(longitude, latitude, "", Cesium.Color.fromRandom({ alpha: 1.0 }), imageUrl, sampleHeight + 5);
  
          } else {
            // if (_this.bubbles) {
            //   _this.bubbles.windowClose();
            // }
            if (labelEntity && lineEntity && pointEntity) {
              // window.viewer.entities.remove(labelEntity);
              // window.viewer.entities.remove(lineEntity);
              // window.viewer.entities.remove(pointEntity);
              window.viewer.entities.removeAll()
              labelEntity = undefined;
              lineEntity = undefined;
              pointEntity = undefined;
            }
          }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  
      },
      /* bubble(pickedObject) {
        if (this.bubbles) {
          this.bubbles.windowClose()
        }
        this.bubbles = new Bubble(pickedObject, window.viewer)
  
      }, */
  
      /**
       * 用于添加poi的icon和label的函数
       * @param {*} lon ：经度
       * @param {*} lat ：纬度
       * @param {*} name ：标签内容
       * @param {*} color ：底部圆和横线的颜色
       * @param {*} url ：icon地址
       */
      poiIconLabelAdd(lon, lat, name, color, url, height) {
        labelEntity = window.viewer.entities.add({
          name: name,
          position: Cesium.Cartesian3.fromDegrees(lon, lat, height),
          // 图标
          billboard: {
            image: url,
            width: 50,
            height: 50,
          },
          label: {
            //文字标签
            text: name,
            font: '20px sans-serif',
            style: Cesium.LabelStyle.FILL,
            // 对齐方式(水平和竖直)
            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
            verticalOrigin: Cesium.VerticalOrigin.CENTER,
            pixelOffset: new Cesium.Cartesian2(20, -2),
            showBackground: true,
            backgroundColor: new Cesium.Color.fromBytes(0, 70, 24),
          },
        });
  
        // 先画线后画点，防止线压盖点
        let linePositions = [];
        linePositions.push(new Cesium.Cartesian3.fromDegrees(lon, lat, 5));
        linePositions.push(new Cesium.Cartesian3.fromDegrees(lon, lat, height));
        lineEntity = window.viewer.entities.add({
          polyline: {
            positions: linePositions,
            width: 1.5,
            material: color,
          }
        })
  
        // 画点
        pointEntity = window.viewer.entities.add({
          // 给初始点位设置一定的离地高度，否者会被压盖
          position: Cesium.Cartesian3.fromDegrees(lon, lat, 5),
          point: {
            color: color,
            pixelSize: 15,
          }
        })
      },
  
  
      testLoadGeoJson() {
        let _this = this;
        this.$axios.get("http://localhost:8090/qingxieshape.json").then((response) => {
          response.data.features.forEach(function (item) {
            let arrPoints = [];
            item.geometry.coordinates.forEach(function (subItem) {
              subItem.forEach(function (subSubItem) {
                arrPoints.push(subSubItem[0]);
                arrPoints.push(subSubItem[1]);
              })
            })
  
            if (item.properties.Layer == "JMD") {
              let primitive = new Cesium.ClassificationPrimitive({
                geometryInstances: new Cesium.GeometryInstance({
                  geometry: new Cesium.PolygonGeometry({
                    polygonHierarchy: new Cesium.PolygonHierarchy(
                      Cesium.Cartesian3.fromDegreesArray(arrPoints),
                    ),
                    extrudedHeight: item.properties.Elevation,//分层顶部海拔
                    height: 0,//分层底部海拔
                  }),
                  attributes: {
                    color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                      Cesium.Color.fromCssColorString("#55DDE0").withAlpha(0)
                    ),
                  },
                  id: Math.random().toString(36).slice(2),
                }),
                classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
              });
  
              window.viewer.scene.primitives.add(primitive);
  
              //获取geojson中心点，用于获取广告牌生成的坐标信息，以及弹框坐标位置
              let polygon = Cesium.Cartesian3.fromDegreesArray(arrPoints);
              var polyCenter = Cesium.BoundingSphere.fromPoints(polygon).center;//中心点
  
              //把geojson数据传给图元
              primitive.itemproperties = item.properties;
              primitive.position = polyCenter;
              Cesium3DTileset          }
          })
  
          const handler = new Cesium.ScreenSpaceEventHandler(window.viewer.scene.canvas);
          handler.setInputAction(function (movement) {
            const pickedObject = window.viewer.scene.pick(movement.endPosition);
            if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id)) {
              // console.log("pickedObject", pickedObject);
              if (pickedObject.id === currentObjectId) {
                return;
              }
              if (Cesium.defined(currentObjectId)) {
                attributes = currentPrimitive.getGeometryInstanceAttributes(
                  currentObjectId
                );
                attributes.color = currentColor;
                attributes.show = currentShow;
                currentObjectId = undefined;
                currentPrimitive = undefined;
                currentColor = undefined;
                currentShow = undefined;
              }
            }
            if (
              Cesium.defined(pickedObject) &&
              Cesium.defined(pickedObject.primitive) &&
              Cesium.defined(pickedObject.id) &&
              Cesium.defined(pickedObject.primitive.getGeometryInstanceAttributes)
            ) {
              currentObjectId = pickedObject.id;
              currentPrimitive = pickedObject.primitive;
              attributes = currentPrimitive.getGeometryInstanceAttributes(
                currentObjectId
              );
              currentColor = attributes.color;
              currentShow = attributes.show;
              if (!window.viewer.scene.invertClassification) {
                attributes.color = [255, 0, 255, 128];
              }
              attributes.show = [1];
            } else if (Cesium.defined(currentObjectId)) {
              attributes = currentPrimitive.getGeometryInstanceAttributes(
                currentObjectId
              );
              attributes.color = currentColor;
              attributes.show = currentShow;
              currentObjectId = undefined;
              currentPrimitive = undefined;
              currentColor = undefined;
            }
          }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  
        }, (err) => {
          // 500响应
          console.log("err", err)
        })
  
      },
      addBillboard(viewer, point) {
        //billboard的特性是无论地球怎么选择，billboard都会对准视角，
        //也就是会随着场景的旋转移动来改变自身的朝向
        let entity = viewer.entities.add({
          id: 1,//id不能重复
          name: "billboard",//可以重复
          position: Cesium.Cartesian3.fromDegrees(point),//指定经纬度来确定世界坐标的位置
          point: {
            color: Cesium.Color.RED,    //点位颜色
            pixelSize: 10                //像素点大小
          },
          billboard: {
            image: billboard,
            show: true,//是否显示
            scale: 1,//放大倍数
            //pixelOffset:new Cesium.Cartesian2(100,200),//像素偏移
            //eyeOffset:new Cesium.Cartesian3(0.0, 1000000.0, 0.0),//视野偏移
            horizontalOrigin: Cesium.HorizontalOrigin.RIGHT,//相对于对象的原点的水平位置
            verticalOrigin: Cesium.VerticalOrigin.TOP,//相对于对象的原点的垂直位置
            heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,//表示相对于地形的位置。CLAMP_TO_GROUND	位置固定在地形上。RELATIVE_TO_GROUND	位置高度是指地形上方的高度。
            color: Cesium.Color.YELLOW.withAlpha(0.8),//指定图像的颜色
            //rotation:Cesium.Math.PI_OVER_TWO,//旋转角度
            //alignedAxis:Cesium.Cartesian3.UNIT_X,//设置世界空间中对齐的轴。对齐轴是广告牌向上矢量指向的单位矢量。默认值为零向量，这意味着广告牌与屏幕向上矢量对齐。
            width: 96,//广告牌的宽度，覆盖之前默认的像素值
            height: 96,//广告牌的高度，覆盖之前默认的像素值
            //scaleByDistance:new Cesium.NearFarScalar(1.5e2, 2.5, 8.0e6,0.0),//设置广告牌的近距离和远距离缩放属性
            //translucencyByDistance:new Cesium.NearFarScalar(1.5e2, 1.0, 8.0e6,0.0),//根据距摄像机的距离来指定广告牌的透明度
            //pixelOffsetScaleByDistance:new Cesium.NearFarScalar(1.5e2, 20, 8.0e6,0.0),//根据距照相机的距离指定广告牌的像素偏移
            //distanceDisplayCondition: new Cesium.DistanceDisplayCondition(100000.0, 2000000.0),//根据与相机的与广告牌远近确定可见性
            disableDepthTestDistance: Number.POSITIVE_INFINITY,//获取或设置与相机的距离，在深度处禁用深度测试,Number.POSITIVE_INFINITY无穷大，不会应用深度测试，0始终应用深度测试，应用深度测试避免地形的遮挡
  
          }
        });
        //克隆一个billboard
        let clone = entity.billboard.clone();
        let cloneEntity = new Cesium.Entity();
        cloneEntity.position = Cesium.Cartesian3.fromDegrees(-90, 40.5);
        cloneEntity.billboard = clone
        viewer.entities.add(cloneEntity);
  
  
        //合并一个billboard,即将billboard所拥有的属性都赋值给billboardGraphics
        let billboardGraphics = new Cesium.BillboardGraphics();
        billboardGraphics.merge(entity.billboard);
        console.log(billboardGraphics)
  
      },
      renderSlm() {
        console.log("renderSlm");
        Cesium.GeoJsonDataSource.load("http://localhost:8090/33333.json", {
          name: "slm",
          clampToGround: true,
          stroke: Cesium.Color.GREENYELLOW,
          strokeWidth: 5,
          fill: Cesium.Color.WHITE.withAlpha(0.01)
        }).then((dataSource) => {
          window.viewer.dataSources.add(dataSource);
          //window.viewer.flyTo(dataSource)
        }).catch(function (error) {
          console.log(error);
        });
      },
      initPick() {
        //console.log("initPick");
        let handler = window.viewer.screenSpaceEventHandler
        //左键点击事件
        handler.setInputAction((event) => {
          //用来拾取三维空间中的物体
          let pickedFeature = window.viewer.scene.pick(event.position);
          //console.log("pickedFeature", pickedFeature);
          if (!Cesium.defined(pickedFeature)) {
            return;
          }
          let entity = pickedFeature.id;
          let primitive = pickedFeature.primitive;
          if (Cesium.defined(entity) && entity instanceof Cesium.Entity && primitive instanceof Cesium.GroundPrimitive) {
            if (pickEntity) {
              pickEntity.polygon.material = Cesium.Color.WHITE.withAlpha(0.01)
            }
            pickEntity = entity
            entity.polygon.material = Cesium.Color.RED.withAlpha(0.5)
  
            //console.log("entity.properties", entity.properties)
            if (entity.properties.hasProperty('FID_1')) {
              let julianDate = Cesium.JulianDate.fromDate(new Date());
              let properties = entity.properties.getValue(julianDate);
              let houseId = properties.houseId;
              console.log(houseId)
            }
          }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
      },
      addPolygonGeometry() {
        let primitive = new Cesium.ClassificationPrimitive({
          geometryInstances: new Cesium.GeometryInstance({
            id: 'polygonInstance2',
            geometry: new Cesium.PolygonGeometry({
              polygonHierarchy: new Cesium.PolygonHierarchy(
                Cesium.Cartesian3.fromDegreesArray([
                  -72.0, 40.0,
                  -70.0, 35.0,
                  -75.0, 30.0,
                  -70.0, 30.0,
                  -68.0, 40.0
                ]),
              ),
              extrudedHeight: 300000,//分层顶部海拔
              height: 0,//分层底部海拔
            }),
            attributes: {
              color: new Cesium.ColorGeometryInstanceAttribute(0, 0, 1, 0.5),
            }
          }),
          classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
  
        });
        console.log("primitive", primitive);
        window.viewer.scene.primitives.add(primitive);
      }
    },
    beforeDestroy() {
      this.$bus.$off('destroyedLabelEntity')
    },
  }
  </script>
  <style scoped lang="less">
  #monomerization1Container {
    width: 100px;
    height: 40px;
    .btn {
      width: 100%;
      height: 100%;
      //background-color: #fff;
      margin-top: 10px;
    }
  }
  </style>