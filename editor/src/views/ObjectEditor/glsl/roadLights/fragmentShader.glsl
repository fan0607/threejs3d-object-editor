uniform float time;
varying vec2 vUv;
uniform sampler2D flowTexture;
uniform sampler2D bgTexture;
void main(void){
    vec2 position=vUv;
    vec4 colora=texture2D(flowTexture,vec2(vUv.x,fract(vUv.y-time)));
    vec4 colorb=texture2D(bgTexture,position.xy);
    gl_FragColor=colorb+colorb*colora;
}