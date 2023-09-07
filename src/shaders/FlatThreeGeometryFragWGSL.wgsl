@group(0) @binding(0) var<uniform> lightPosition : vec4<f32>;
@group(0) @binding(5) var mySampler: sampler;
@group(1) @binding(2) var textureImg: texture_2d<f32>;
@group(1) @binding(3) var shadowMap: texture_depth_2d;
@group(1) @binding(4) var shadowSampler: sampler_comparison;
@group(1) @binding(5) var imgSampler: sampler;

@fragment
fn main(
    @location(0) fragUV : vec2<f32>,
    @location(1) fragPosition: vec4<f32>,
    @location(2) fragNormal: vec3<f32>,
    @location(3) timeOfFrag: f32,
    @location(4) shadowPos: vec3<f32>,
) -> @location(0) vec4<f32> {
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
    // return vec4<f32>(lightFactor * vec3<f32>(fragUV,1.0), 1.0);
    return vec4<f32>(lightFactor * vec3<f32>(fragUV,1.0), 1.0);
    // let textureImgColor = textureSample(textureImg,imgSampler, fragUV);
    // return vec4<f32>(lightFactor * textureImgColor.xyz, 1.0);
}