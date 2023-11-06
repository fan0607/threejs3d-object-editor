import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';


export let composer;
export function initComposer(renderer,camera,scene){
    composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
}
export function outLineItem(renderer,scene,camera,mesh){
    
    const outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
    if(mesh)
    outlinePass.selectedObjects = [mesh];
    outlinePass.visibleEdgeColor.set('gray'); 
    outlinePass.edgeThickness = 10; 
    outlinePass.pulsePeriod = 0;
    outlinePass.edgeGlow = 0.5;
    outlinePass.edgeGlowAlpha = 0.5;
    outlinePass.edgeStrength = 5;


    composer.addPass(outlinePass);
    return outlinePass;
}
export function outLineItem2(renderer,scene,camera,color='#00ffff'){

    
    const outlinePass2 = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
    // outlinePass2.selectedObjects = [];
    outlinePass2.visibleEdgeColor.set(color); 
    outlinePass2.edgeThickness = 1; //边缘厚度
    outlinePass2.edgeStrength = 6; //边缘强度
    outlinePass2.pulsePeriod = 5;

    composer.addPass(outlinePass2);
    return outlinePass2;
}


