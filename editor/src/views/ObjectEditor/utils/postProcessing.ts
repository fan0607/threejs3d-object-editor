import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import {SMAAPass} from 'three/addons/postprocessing/SMAAPass.js';
// 伽马校正后处理Shader
import {GammaCorrectionShader} from 'three/addons/shaders/GammaCorrectionShader.js';

let composer;
export const initPostProcessing = (scene:THREE.Scene, renderer:THREE.WebGLRenderer, camera:THREE.PerspectiveCamera, threeOceanWidth:number, threeOceanHeight:number) => {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    // 创建伽马校正通道
    const gammaPass= new ShaderPass(GammaCorrectionShader);
    composer.addPass(gammaPass);

    const pixelRatio = renderer.getPixelRatio();
    const smaaPass = new SMAAPass(threeOceanWidth * pixelRatio, threeOceanHeight * pixelRatio);
    composer.addPass(smaaPass);
    // 设置设备像素比，避免canvas画布输出模糊
    renderer.setPixelRatio(window.devicePixelRatio);
    const FXAAPass = new ShaderPass( FXAAShader );
    // width、height是canva画布的宽高度
    FXAAPass.uniforms.resolution.value.x = 1 /(threeOceanWidth*pixelRatio);
    FXAAPass.uniforms.resolution.value.y = 1 /(threeOceanHeight*pixelRatio);
    // composer.addPass( FXAAPass );


    const v2 = new THREE.Vector2(threeOceanWidth, threeOceanHeight);
    const outlinePass = new OutlinePass(v2, scene, camera);
    //模型描边颜色，默认白色         
    outlinePass.visibleEdgeColor.set(0x00ffff); 
    //高亮发光描边厚度
    outlinePass.edgeThickness = 2; 
    //高亮描边发光强度
    outlinePass.edgeStrength = 5; 
    //模型闪烁频率控制，默认0不闪烁
    outlinePass.pulsePeriod = 0;

    composer.addPass(outlinePass);
    return [composer, outlinePass]

}