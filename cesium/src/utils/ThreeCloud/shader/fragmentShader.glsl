// 时间
uniform float iTime;
// 分辨率
uniform vec2 iResolution;
// 鼠标位置
uniform vec2 iMouse;
// credits:
//
//    ollj: suggested lower-iteration fractal terrain hull to speed up traversal
//    iq: suggested breaking shading code out of the raymarch loop for speedup
//        also suggested fresnel with low-iter terrain normal for improved visual

// if you don't like TAA, go to Common file to uncomment DISABLE_TAA macro

void main()
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = gl_FragCoord/iResolution.xy;
    
#ifdef DISABLE_TAA
    vec3 result = texelFetch(iChannel1, ivec2(gl_FragCoord), 0).rgb;
#else
    // optinal sharpness filter to remove TAA blur
    vec3 result = vec3(0.0);
    //float sharpness = -iMouse.w/450.0;
    float sharpness = 0.1;
    for (int dy = -1; dy <= 1; ++dy)
    {
        for (int dx = -1; dx <= 1; ++dx)
        {
            float weight = (dx == 0 && dy == 0)? (1.0 + 8.0*sharpness): -sharpness;
            result += weight * texelFetch(iChannel0, ivec2(gl_FragCoord)+ivec2(dx,dy), 0).rgb;
        }
    }
#endif

    gl_FragColor = vec4(result, 1.0);
}