@binding(0) @group(0) var lastFrameTexture: texture_2d<f32>;
@binding(1) @group(0) var mySampler: sampler;
@binding(2) @group(1) var cubeTextureImg: texture_2d<f32>;
@binding(3) @group(1) var shadowMap: texture_depth_2d;
@binding(4) @group(1)  var shadowSampler: sampler_comparison;
@binding(5) @group(0) var<uniform> lightPosition : vec4<f32>;

@fragment
fn main(
    @location(0) fragUV : vec2<f32>,
    @location(1) fragPosition: vec4<f32>,
    @location(2) fragNormal: vec4<f32>,
    @location(3) timeOfFrag: f32,
) -> @location(0) vec4<f32> {
    // 随时间渐变
    // return vec4<f32>(
    //     fragPosition.x * timeOfFrag,
    //     fragPosition.y * timeOfFrag,
    //     fragPosition.z,
    //     1.0
    //     );    
    // return lastFrameTexture;
  
    // 上一帧画面
    // let texColor = textureSample(lastFrameTexture, mySampler, fragUV * 0.8 + vec2(0.1));
    // let f = select(1.0, 0.0, length(texColor.rgb - vec3(0.5)) < 0.01);
    // return f * texColor + (1.0 - f) * fragPosition;

    // 图片 + 渐变 + 上一帧画面
    let texColor = textureSample(lastFrameTexture, mySampler, fragUV * 0.8 + vec2(0.1));
    let texColor_img = textureSample(cubeTextureImg, mySampler, fragUV * 0.8 + vec2(0.1));
    let f = select(1.0, 0.0, length(texColor.rgb - vec3(0.5)) < 0.01);
    let f_img = select(1.0, 0.0, length(texColor_img.rgb - vec3(0.5)) < 0.01);
    // return f * texColor;w) * 0.7 + (f * texColor + (1.0 - f) * fragPosition);
    return texColor_img * timeOfFrag + (1 - timeOfFrag) * texColor;
    
    // 纯图片
    // let texColor_img = textureSample(cubeTextureImg, mySampler, fragUV);
    // return texColor_img;
}