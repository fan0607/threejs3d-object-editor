// 时间
uniform float iTime;
// 分辨率
uniform vec2 iResolution;
// 鼠标位置
uniform vec2 iMouse;

const int NUM_STEPS = 8;//光追迭代次数，迭代次数越多性能越低。
const float PI      = 3.141592;//圆周率
const float EPSILON = 1e-3;//极小值，用于避免除零错误，以及在光线追踪算法中用于避免光线与海面相交时的自相交问题。

#define EPSILON_NRM (0.1 / iResolution.x)//用于计算法线的极小值，它与屏幕分辨率成反比，因此在分辨率较低的设备上，法线会更加精确。
// sea
const int ITER_GEOMETRY = 3;//map函数中使用。
const int ITER_FRAGMENT = 5;//控制迭代的次数,在map_detailed函数中使用。
const float SEA_HEIGHT = 0.6;//海面高度，在map和map_detailed函数中使用。
const float SEA_CHOPPY = 4.0;//海面波动，在map和map_detailed函数中使用，用sea_octave函数中。
const float SEA_SPEED = 0.8;//海面速度，在SEA_TIME中使用，海面时间。
const float SEA_FREQ = 0.16;//海面频率，在map和map_detailed函数中使用，用sea_octave函数中。
const vec3 SEA_BASE = vec3(0.1,0.19,0.22);//海面颜色，getSeaColor函数中使用。
const vec3 SEA_WATER_COLOR = vec3(0.8,0.9,0.6);//海水颜色，getSeaColor函数中使用。
#define SEA_TIME (1.0 + iTime * SEA_SPEED)//海面时间，在map和map_detailed函数中使用，用sea_octave函数中。
const mat2 octave_m = mat2(1.6,1.2,-1.2,1.6);//海面的噪声函数，用于生成海面的波动效果，在map和map_detailed函数中使用。

// math
mat3 fromEuler(vec3 ang) {//将欧拉角转换为3D旋转矩阵，用于确定视角
    vec2 a1 = vec2(sin(ang.x),cos(ang.x));
    vec2 a2 = vec2(sin(ang.y),cos(ang.y));
    vec2 a3 = vec2(sin(ang.z),cos(ang.z));
    mat3 m;
    m[0] = vec3(a1.y*a3.y+a1.x*a2.x*a3.x,a1.y*a2.x*a3.x+a3.y*a1.x,-a2.y*a3.x);
    m[1] = vec3(-a2.y*a1.x,a1.y*a2.y,a2.x);
    m[2] = vec3(a3.y*a1.x*a2.x+a1.y*a3.x,a1.x*a3.x-a1.y*a3.y*a2.x,a2.y*a3.y);
    return m;
}
float hash( vec2 p ) {// 函数用于生成伪随机数，在noise函数中使用
    float h = dot(p,vec2(127.1,311.7));
    return fract(sin(h)*43758.5453123);
}
float noise( in vec2 p ) {//函数用于生成二维噪声值，在sea_octave函数中使用。
    vec2 i = floor( p );
    vec2 f = fract( p );    
    vec2 u = f*f*(3.0-2.0*f);
    return -1.0+2.0*mix( mix( hash( i + vec2(0.0,0.0) ), 
                     hash( i + vec2(1.0,0.0) ), u.x),
                mix( hash( i + vec2(0.0,1.0) ), 
                     hash( i + vec2(1.0,1.0) ), u.x), u.y);
}

// lighting
float diffuse(vec3 n,vec3 l,float p) {//用于计算漫反射光照，在getSeaColor函数中使用。计算漫反射，基于法线和光线方向，用于模拟光照对物体表面的影响。
    return pow(dot(n,l) * 0.4 + 0.6,p);
}
float specular(vec3 n,vec3 l,vec3 e,float s) {    //用于计算镜面反射光照，在getSeaColor函数中使用。计算镜面反射，基于观察者的视角，用于产生光泽效果。
    float nrm = (s + 8.0) / (PI * 8.0);
    return pow(max(dot(reflect(e,n),l),0.0),s) * nrm;
}

// sky
vec3 getSkyColor(vec3 e) {//根据光线的方向返回天空的颜色，在main和getSeaColor函数中使用。根据观察角度计算天空颜色的变化
    e.y = max(e.y,0.0);
    return vec3(pow(1.0-e.y,2.0), 1.0-e.y, 0.6+(1.0-e.y)*0.4);
}

// sea
float sea_octave(vec2 uv, float choppy) {//用于生成海洋的高度图的一层 octave，根据输入的二维坐标和波动参数生成海洋表面高度。在 map 函数和map_detailed函数中使用。使用噪声函数增加海洋表面的多维度波动效果
    //将当前的二维坐标 uv 加上由 noise 函数生成的值，这是为了打破波的规则性，使其看起来更自然。noise 函数基于坐标生成一个伪随机值，通常用来模拟复杂的自然模式，如云彩、岩石纹理或在这个例子中的海水波纹。
    uv += noise(uv);        
    //这里计算了一个正弦波的绝对值，然后从 1.0 减去该值，生成波形。uv 作为正弦函数的输入，用来创建波的周期性变化。
    vec2 wv = 1.0-abs(sin(uv));
    //类似地，这一行计算了余弦波形的绝对值，再次模拟波动
    vec2 swv = abs(cos(uv));
    // mix 函数在这里用来混合两个波形向量 wv（正弦波形）和 swv（余弦波形）。mix 的第三个参数 wv 决定了混合的比例，这里用 wv 自己作为比例因子，这意味着混合是基于波动的强度自适应的。
    //由于正弦和余弦是相互垂直的波动（相位差90度），它们的结合可以模拟多方向的水面波纹。
    wv = mix(wv,swv,wv);
    //最后，计算最终的波动模式。它首先计算 wv.x 和 wv.y（这两个值都是通过前面的计算得到的波动强度）的乘积，然后对该乘积进行幂运算（0.65 作为指数），这样可以调整波的形状。结果再次被提升到 choppy 参数指定的幂，choppy 控制了波的锐利程度或削峰效果。
    return pow(1.0-pow(wv.x * wv.y,0.65),choppy);
}

float map(vec3 p) {//map 用于计算海洋的高度，它通过多次调用 sea_octave 函数叠加不同频率的波浪来生成高度，在heightMapTracing函数中使用。
    float freq = SEA_FREQ;
    float amp = SEA_HEIGHT;
    float choppy = SEA_CHOPPY;
    vec2 uv = p.xz; uv.x *= 0.75;

    float d, h = 0.0;    
    for(int i = 0; i < ITER_GEOMETRY; i++) {        
        d = sea_octave((uv+SEA_TIME)*freq,choppy);
        d += sea_octave((uv-SEA_TIME)*freq,choppy);
        h += d * amp;        
        uv *= octave_m; freq *= 1.9; amp *= 0.22;
        choppy = mix(choppy,1.0,0.2);
    }
    return p.y - h;
}

float map_detailed(vec3 p) {//map_detailed 与 map 类似，但用于更详细的高度计算，在getNormal函数中使用。
    float freq = SEA_FREQ;
    float amp = SEA_HEIGHT;
    float choppy = SEA_CHOPPY;
    vec2 uv = p.xz; uv.x *= 0.75;

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

vec3 getSeaColor(vec3 p, vec3 n, vec3 l, vec3 eye, vec3 dist) {  //根据光线与海洋的交点以及光线的方向，计算出海洋的颜色
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
vec3 getNormal(vec3 p, float eps) {//用于计算光线与海洋交点处的法线。通过计算高度的微小变化来推断水面的法线向量。
    vec3 n;
    n.y = map_detailed(p);    
    n.x = map_detailed(vec3(p.x+eps,p.y,p.z)) - n.y;
    n.z = map_detailed(vec3(p.x,p.y,p.z+eps)) - n.y;
    n.y = eps;
    return normalize(n);
}
//地形跟踪算法
float heightMapTracing(vec3 ori, vec3 dir, out vec3 p) {  //用于确定光线与海洋表面的交点位置。光线追踪函数，用于找到观察者视线与海面交点的位置
    //ori,dir是光线的原点和方向，p是交点位置
    float tm = 0.0; // 追踪开始距离
    float tx = 1000.0; // 最大追踪距离
    float hx = map(ori + dir * tx); // 在最大距离处的海拔高度
    if(hx > 0.0) return tx; // 如果最大距离处的高度大于水平面，直接返回该距离，因为这意味着远端的点不在水面下，不需要进一步追踪。

    float hm = map(ori + dir * tm); // 在追踪起点的海拔高度
    float tmid = 0.0; // 初始化中点距离

    for(int i = 0; i < NUM_STEPS; i++) { /*最大迭代次数，每次循环将尝试缩小光线与海面交点的搜索范围，在每次迭代中，使用中点距离 tmid 来计算新的海拔高度 hmid，
    如果该高度小于零，说明中点在水下，这时候 tx 和 hx（最大距离的值） 更新为 tmid 和 hmid。否则，更新 tm 和 hm（追踪开始距离的值） 为新的值。*/
        tmid = mix(tm,tx, hm/(hm-hx)); // 使用线性插值计算中点距离
        p = ori + dir * tmid; // 计算中点位置
        float hmid = map(p); // 在中点位置的海拔高度

        if(hmid < 0.0) { // 如果中点在水下
            tx = tmid; // 将当前中点设置为新的追踪上限
            hx = hmid; // 更新上限处的海拔高度
        } else {
            tm = tmid; // 将当前中点设置为新的追踪下限
            hm = hmid; // 更新下限处的海拔高度
        }
    }

    return tmid; // 返回中点距离，即光线与海面的交点距离
}

void main() {/*在这里进行了片元着色器的主要计算和渲染步骤。
    首先，计算了光线的方向，通过 heightMapTracing 函数确定光线与海洋表面的交点。
    然后，计算了光线与交点处的法线和光线方向的夹角，以及光线的颜色。
    最后，将计算得到的颜色赋给 gl_FragColor，并进行后期处理。*/
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    uv = uv * 2.0 - 1.0;
    uv.x *= iResolution.x / iResolution.y;    
    float time = iTime * 0.1 + iMouse.x*0.01;

    // ray，光线追踪算法
    //角度
    // vec3 ang = vec3(sin(time*3.0)*0.1,sin(time)*0.2+0.3,time);  
    //ang.y代表偏航角，但由于该欧拉角改变的是射线的方向，射线绕y轴旋转，与y轴的水平面夹角就变化了，那从射线方向出去的光线看到的俯仰角度就变化了
    vec3 ang = vec3(0.1,0.6,.0);    
    vec3 ori = vec3(0.0,5.0,0.0);//光线的原点
    //方向
    vec3 dir = normalize(vec3(uv.xy,-10.0)); 
    // dir.z += length(uv) * 0.15;//将光线的方向与屏幕坐标相关联，这样可以在屏幕中心附近产生更多的光线，从而提高了海面的细节。
    dir = normalize(dir) * fromEuler(ang);

    // tracing
    vec3 p;
    heightMapTracing(ori,dir,p);
    vec3 dist = p - ori;//计算交点到原点的向量差
    /*getNormal 函数计算在点 p 处海面的法线向量 n。
    法线是垂直于表面的一个单位向量，它对于光照和渲染至关重要，因为它决定了表面如何与光互动，影响到反射、折射和阴影等效果。
    dot(dist,dist) 计算 dist 向量的点积，其实际上等于 dist 向量长度的平方，这个值随着光线的远近而变化，表示从原点到交点的距离的平方。
    这个距离的平方乘以一个很小的数 EPSILON_NRM（一个正规化的阈值）提供了法线计算的一个偏移量，
    用于避免浮点数精度误差可能导致的任何问题，这是一种常见的技术，称为“法线偏移”或“阴影偏移”，
    用来减少渲染时的视觉错误，如自阴影（当一个表面错误地投影阴影到自身时）。*/
    vec3 n = getNormal(p, dot(dist,dist) * EPSILON_NRM);//计算交点处的法线
    vec3 light = normalize(vec3(0.0,2.0,0.8)); // 光线方向

    // color
    vec3 color = mix(
        // getSkyColor(dir),
        vec3(0.0,0.0,0.0),
        getSeaColor(p,n,light,dir,dist),
        // pow(smoothstep(0.0,-0.05,dir.y),0.1));
        1.6);
    // post
    gl_FragColor = vec4(pow(color,vec3(0.75)), 1.0);
}