@binding(0) @group(0) var lastFrameTexture: texture_2d<f32>;
@binding(1) @group(0) var mySampler: sampler;
@binding(5) @group(0) var<uniform> lightPosition : vec4<f32>;
@binding(2) @group(1) var cubeTextureImg: texture_2d<f32>;
@binding(3) @group(1) var shadowMap: texture_depth_2d;
@binding(4) @group(1)  var shadowSampler: sampler_comparison;

@fragment
fn main(
    @location(0) fragUV : vec2<f32>,
    @location(1) fragPosition: vec4<f32>,
    @location(2) fragNormal: vec3<f32>,
    @location(3) timeOfFrag: f32,
    @location(4) shadowPos: vec3<f32>,
) -> @location(0) vec4<f32> {
    // 随时间渐变
    // return vec4<f32>(
    //     fragPosition.x,
    //     fragPosition.y * timeOfFrag,
    //     fragPosition.z,
    //     1.0
    //     );    
  
    // 上一帧画面
    // let texColor = textureSample(lastFrameTexture, mySampler, fragUV * 0.8 + vec2(0.1));
    // let f = select(1.0, 0.0, length(texColor.rgb - vec3(0.5)) < 0.01);
    // return f * texColor + (1.0 - f) * fragPosition;

    // 图片 + 渐变 + 上一帧画面
    // let texColor = textureSample(lastFrameTexture, mySampler, fragUV * 0.8 + vec2(0.1));
    // let texColor_img = textureSample(cubeTextureImg, mySampler, fragUV * 0.8 + vec2(0.1));
    // let f = select(1.0, 0.0, length(texColor.rgb - vec3(0.5)) < 0.01);
    // let f_img = select(1.0, 0.0, length(texColor_img.rgb - vec3(0.5)) < 0.01);
    // return texColor_img * timeOfFrag + (1 - timeOfFrag) * texColor;
    
    // 纯图片
    // let texColor_img = textureSample(cubeTextureImg, mySampler, fragUV);
    // return texColor_img;

    // // 图片 + 渐变 + 上一帧画面 + 阴影
    // Directional Light
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
    // 上一帧画面
    let texColor = textureSample(lastFrameTexture, mySampler, fragUV * 0.8 + vec2(0.1));
    // 图片
    let texColor_img = textureSample(cubeTextureImg, mySampler, fragUV * 0.8 + vec2(0.1));

    // var color_mixin = texColor_img * timeOfFrag + (1 - timeOfFrag) * texColor;
    var color_mixin = texColor_img;

    return lightFactor * color_mixin;
}