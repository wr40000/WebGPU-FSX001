@binding(0) @group(0) var lastFrameTexture: texture_2d<f32>;
@binding(1) @group(0) var mySampler: sampler;
@binding(5) @group(0) var<uniform> lightPosition : vec4<f32>;
@binding(2) @group(1) var cubeTextureImg: texture_2d<f32>;
@binding(3) @group(1) var shadowMap: texture_depth_2d;
@binding(4) @group(1)  var shadowSampler: sampler_comparison;
// cubemap
@group(0) @binding(8) var mySamplerCube: sampler;
@group(0) @binding(9) var myTexture: texture_cube<f32>;

@fragment
fn main(
    @location(0) fragUV : vec2<f32>,
    @location(1) fragPosition: vec3<f32>,
    @location(2) fragNormal: vec3<f32>,
    @location(3) timeOfFrag: f32,
    @location(4) shadowPos: vec3<f32>,
    @location(5) chooseFragmentAttr1: vec4<f32>,
    @location(6) chooseFragmentAttr2: vec4<f32>,
    @location(7) chooseFragmentAttr3: vec4<f32>,
    @location(8) chooseFragmentAttr4: vec4<f32>,
    @location(9) cameraPos_: vec4<f32>
) -> @location(0) vec4<f32> {    

    // 反射向量 --采样天空盒纹理 output.Position  cameraPos  modelMatrix * vec4<f32>(normal,1.0)
    var texCube = textureSample(myTexture, mySamplerCube, reflect(fragPosition - cameraPos_.xyz, fragNormal) - vec3(0.5));
    // var cubemapVec = vec_sampler.xyz - vec3(0.5);
    // var vec_sampler = (fragPosition - cameraPos_.xyz) *  2 * fragNormal * fragNormal - (fragPosition - cameraPos_.xyz);

    // 上一帧画面a
    let texColor = textureSample(lastFrameTexture, mySampler, fragUV * 0.8 + vec2(0.1));
    let f = select(1.0, 0.0, length(texColor.rgb - vec3(0.5)) < 0.01);
    // 图片
    let texColor_img1 = textureSample(cubeTextureImg, mySampler, fragUV * 0.8 + vec2(0.1));
    // 图片 + UV坐标复合
    let texColor_img = textureSample(cubeTextureImg, mySampler, fragUV);
    // 图片 + 渐变 + 上一帧画面 + 阴影
    // Directional Light   点积且排除夹角为钝角情况--这意味着该点在灯光背面
    let diffuse: f32 = max(dot(normalize(lightPosition.xyz), fragNormal), 0.0);
    // add shadow factor
    var shadow : f32 = 0.0;
    // // apply Percentage-closer filtering (PCF)
    // // sample nearest 9 texels to smooth result
    let size = f32(textureDimensions(shadowMap).x);
    for (var y : i32 = -1 ; y <= 1 ; y = y + 1) {
        for (var x : i32 = -1 ; x <= 1 ; x = x + 1) {
            let offset = vec2<f32>(f32(x) / size, f32(y) / size);
            shadow = shadow + textureSampleCompare(
                shadowMap, 
                shadowSampler,
                shadowPos.xy + offset, 
                shadowPos.z - 0.005  // apply a small bias to avoid acne
            );
        }
    }
    shadow = shadow / 9.0;
    // // ambient + diffuse * shadow
    let lightFactor = min(0.3 + shadow * diffuse, 1.0);
    var color_mixin = texColor_img1 * timeOfFrag + (1 - timeOfFrag) * texColor;

    let ambintLightColor = vec3(1.0,1.0,1.0);
    let pointLightColor = vec3(1.0,1.0,1.0);
    let dirLightColor = vec3(1.0,1.0,1.0);
    var lightResult = vec3(0.0, 0.0, 0.0);

    let ambientIntensity: f32 = chooseFragmentAttr1.y;
    var pointLight: array<vec4<f32>, 2>;
    pointLight[0] = chooseFragmentAttr2;
    pointLight[1] = chooseFragmentAttr3;
    let directionLight: vec4<f32> = chooseFragmentAttr4;

    // ambient
    lightResult += ambintLightColor * ambientIntensity;

    // Directional Light
    // 将directionLight数组的第一个元素directionLight[0]的前三个
    // 分量（x、y和z）提取出来，并赋值给directionPosition变量。这里使用.xyz语法表示提取vec4中的前三个分量。
    var directionPosition = directionLight.xyz;
    var directionIntensity: f32 = directionLight.w;
    lightResult += dirLightColor * directionIntensity * diffuse;

    // Point Light
    var pointPosition = pointLight[0].xyz;
    var pointIntensity: f32 = pointLight[1].x;
    var pointRadius: f32 = pointLight[1].y;
    var L = pointPosition - fragPosition;
    var distance = length(L);
    if(distance < pointRadius){
        // 计算漫反射分量。这里使用点光源方向向量与法线向量的点积，确保夹角在 0 到 90 度之间。
        var diffuse: f32 = max(dot(normalize(L), fragNormal), 0.0);
        // 计算距离衰减因子。这里使用了一个简单的二次方衰减，距离越远，影响越小。
        var distanceFactor: f32 = pow(1.0 - distance / pointRadius, 2.0);
        // 根据漫反射、光照强度和距离衰减，将点光源的颜色叠加到 lightResult 中。
        lightResult += pointLightColor * pointIntensity * diffuse * distanceFactor;
    }


    for(var i = 0u; i < 4; i++){
        let vecAttr = chooseFragmentAttr1;
        if(4.0 < vecAttr.x){
            return texCube;

        }else if(3.5 < vecAttr.x){
            return texColor;
        }else if(2.5 < vecAttr.x){
            return texColor_img1 * timeOfFrag + (1 - timeOfFrag) * texColor;
        }else if(1.5 < vecAttr.x){
            // return texColor_img * lightFactor;
            return vec4<f32>(texColor_img.xyz * lightResult, 1.0);
        }else{
            
            return lightFactor * color_mixin;
        }
    }
    return texColor_img; 

    // 上一帧画面
    // return texColor;

    // 图片 + 渐变 + 上一帧画面
    // return texColor_img1 * timeOfFrag + (1 - timeOfFrag) * texColor;
    
    // 纯图片
    // return texColor_img;

    // 图片 + 渐变 + 上一帧画面 + 阴影
    // return lightFactor * color_mixin;
}