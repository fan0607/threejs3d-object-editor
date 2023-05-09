import * as Cesium from 'cesium'
export * as Cesium from 'cesium'
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3ZmQxNDc1MS05ZGYwLTQyMDktYjVlOS02MzQ0ZGJkNzkxZDEiLCJpZCI6MTIwOTE1LCJpYXQiOjE2NzMzNTY4NjF9.IJXioTp0FvkLeyEsrCPt1Fql0iZzS3GpeFXRacToz_Y'
export function getPolyline(viewer){
    // return viewer.entities.add({
    //     polygon: {
    //         hierarchy: Cesium.Cartesian3.fromDegreesArray([
    //         -75.60217330403601,
    //         40.04102882709425,
    //         -75.59968252414251,
    //         40.04093615560871,
    //         -75.598020153828,/*  */
    //         40.04079437042357,
    //         -75.59674934074435,
    //         40.040816173283304,
    //         -75.59630042791713,
    //         40.03986900370842,
    //         -75.59563636849978,
    //         40.03930996506271,
    //         -75.59492397899098,
    //         40.03873932846581,
    //         -75.59457991226778,
    //         40.038392701955786,
    //         -75.59424838652453,
    //         40.03775403572295,
    //         -75.59387104290336,
    //         40.03677022167725,
    //         -75.59355000490342,
    //         40.03588760913535,
    //         ]),
    //         width: 8,
    //         // material: new Cesium.PolylineOutlineMaterialProperty({
    //         //     color: Cesium.Color.YELLOW,
    //         //     outlineWidth: 2,
    //         //     outlineColor: Cesium.Color.BLACK,
    //         // }),
    //         material: Cesium.Color.RED,
    //         clampToGround: true,
    //     },
    // });
    return viewer.entities.add({
        name: "Red wall at height",
        wall: {
          show: true,
  
          positions: Cesium.Cartesian3.fromDegreesArrayHeights([
            -115.0,
            44.0,
            200000.0,
            -90.0,
            44.0,
            200000.0,
            -115.0,
            61.0,
            200000.0,
            -115.0,
            44.0,
            200000.0,
          ]),
  
          // 用于墙底而不是地球表面的高度数组
          minimumHeights: [0.0, 0.0,0.0, 0.0],
          // 用于墙顶的高度数组，而不是每个位置的高度
          // maximumHeights: [],
  
          granularity: Cesium.Math.RADIANS_PER_DEGREE, // 指定矩形上各点之间的角度距离
          fill: true,
          material: Cesium.Color.RED,
  
          outline: false,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 1.0,
  
          shadows: Cesium.ShadowMode.DISABLED,
          // distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
          //   1.0e3,
          //   2.0e3
          // ),
        },
      });

}