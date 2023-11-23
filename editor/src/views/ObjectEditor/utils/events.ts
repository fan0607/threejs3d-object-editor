export default function onWindowResize(camera:THREE.PerspectiveCamera, renderer:THREE.Renderer, threeOceanWidth:number, threeOceanHeight:number) {

    camera.aspect = threeOceanWidth / threeOceanHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(threeOceanWidth, threeOceanHeight);
}