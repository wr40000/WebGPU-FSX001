@group(0) @binding(0) var<uniform> lightPosition : vec4<f32>;
@group(0) @binding(5) var mySampler: sampler;
@group(1) @binding(2) var textureImg: texture_2d<f32>;
@group(1) @binding(3) var shadowMap: texture_depth_2d;
@group(1) @binding(4) var shadowSampler: sampler_comparison;
@group(1) @binding(5) var imgSampler: sampler;

@fragment
fn main(
    @location(0) fragUV : vec2<f32>,
    @location(1) fragInPosition: vec4<f32>,
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













































// // shaderToy试做
// @group(0) @binding(0) var<uniform> lightPosition : vec4<f32>;
// @group(0) @binding(5) var mySampler: sampler;
// @group(1) @binding(2) var textureImg: texture_2d<f32>;
// @group(1) @binding(3) var shadowMap: texture_depth_2d;
// @group(1) @binding(4) var shadowSampler: sampler_comparison;
// @group(1) @binding(5) var imgSampler: sampler;

// fn axios(normalUV : vec2<f32>) -> vec3<f32>{
//     var outColor = vec3<f32>(0.);
//     if(abs(normalUV.y) < fwidth(normalUV.y)){
//         outColor = vec3<f32>(1.0, 0.0, 0.0);
//     }
//     if(abs(normalUV.x) < fwidth(normalUV.x)){
//         outColor = vec3<f32>(0.0, 1.0, 0.0);
//     }
//     var cell = fract(normalUV);
//     if(cell.x < fwidth(normalUV.x)){
//         outColor = vec3<f32>(1.0);
//     }
//     if(cell.y < fwidth(normalUV.y)){
//         outColor = vec3<f32>(1.0);
//     }
//     return outColor;
// };
// // fn Grid(uv: vec2<f32>) -> vec3<f32> {
// //     var color:vec3<f32> = vec3(0.);
// //     var fraction: vec2<f32> = 1. - 2. * abs(fract(uv) - 0.5);

// //     if (abs(uv.x) <= 2. * fwidth(uv.x)) {
// //         color.g = 1.;
// //     } else if (abs(uv.y) <= 2. * fwidth(uv.y)) {
// //         color.r = 1.;
// //     } else if (fraction.x < 3. * fwidth(uv.x) || fraction.y < 3. * fwidth(uv.y)) {
// //         color = vec3(1.);
// //     }
// //     return color;
// // };
// fn segment(p: vec2<f32>, a: vec2<f32>, b: vec2<f32>, w: f32) -> f32{
//     var f:f32 = 0.;
//     var ba:vec2<f32> = b - a;
//     var pa:vec2<f32> = p - a;
//     var proj:f32 = clamp(dot(pa, ba) / dot(ba, ba), 0., 1.);
//     var d:f32 = length(proj * ba - pa);
//     if (d <= w) {
//         f = 1.;
//     }
//     return f;
// };

// @fragment
// fn main(
//     @builtin(position) fragInPos : vec4<f32>,
//     @builtin(front_facing) frontFacing : bool,
//     // @builtin(frag_depth) fragDep : f32,
//     @builtin(sample_index) sampleIndex : u32,
//     @builtin(sample_mask) sampleMask : u32,

//     @location(0) fragUV : vec2<f32>,
//     @location(1) fragInPosition: vec4<f32>,
//     @location(2) fragNormal: vec3<f32>,
//     @location(3) timeOfFrag: f32,
//     @location(4) shadowPos: vec3<f32>,
// ) -> @location(0) vec4<f32> {
//     // var outColor = vec4<f32>(fragUV,1.0,1.0);
//     // return vec4<f32>(sin(fragInPos.x),cos(fragInPos.y),1.0,1.0);

//     var uv = (fragUV - vec2<f32>(0.5, 0.5)) * 2;
//     // var outColor = axios(uv);

//     var outColor = vec3<f32>(segment(uv, vec2(2.0,2.0), vec2(-2.0,-2.0), fwidth(fragUV.x)));;
//     return vec4<f32>(outColor,1.0);
// }