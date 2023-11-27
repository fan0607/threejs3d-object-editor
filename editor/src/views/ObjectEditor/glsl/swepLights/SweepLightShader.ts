const Shader = {
  vertexShader: `
        varying vec3 vp;
        void main(){
           vp = position;
           gl_Position	= projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
  fragmentShader: `
        varying vec3 vp;
        uniform vec3 u_color;
        uniform vec3 u_tcolor;
        uniform float u_r;
        uniform float u_length;
        uniform float u_height;

        //求圆半径
        float getLeng(float x, float y){
            return  sqrt((x-0.0)*(x-0.0)+(y-0.0)*(y-0.0));
        }
        void main(){
            vec3 vColor = u_color;
            float uLength = getLeng(vp.x,vp.z);
            //建筑物渐变
            vColor=mix(vec3(0.0,0.1,0.1),vec3(0.0,1.0,1.0),sqrt(vp.y/u_height));
            //光环扫光
            if ( uLength <= u_r && uLength > u_r - u_length ) {
                if( vp.y>0.0){
                    vColor = u_tcolor;
                }
            }


             gl_FragColor = vec4(vColor,1.0);
        }
    `
}

export default {
  Shader
}
