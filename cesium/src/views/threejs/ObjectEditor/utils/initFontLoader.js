import font from '../../../../assets/Alimama FangYuanTi VF_Regular.json?url'
import * as THREE from 'three'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';  
export async function initFontLoader(text,pos) {
    const loader = new FontLoader();
    let fonts = await new Promise((resolve) => {
        loader.load(font, (font) => {
            const geometry = new TextGeometry(text, {
                font: font,
                size: 16,
                height: .5,
                curveSegments: 1.2,//曲线段数
                bevelEnabled: true,
                bevelThickness: 1.0,//斜角厚度
                bevelSize: .5,//斜角大小
                bevelOffset: 0,
                bevelSegments: 5
            });
            const material = new THREE.MeshPhongMaterial({ color: 0xffffff });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.applyQuaternion(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI/2));
            mesh.position.copy(pos.clone().add(new THREE.Vector3(0, -5, 0)));
            resolve(mesh);
        }, (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        }, (err) => {
            console.log('err: ', err);
            console.log('An error happened');

        });
    })
    return fonts;
}