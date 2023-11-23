export default function onWindowResize(camera, renderer, threeOceanWidth, threeOceanHeight) {

    camera.aspect = threeOceanWidth / threeOceanHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(threeOceanWidth, threeOceanHeight);
}