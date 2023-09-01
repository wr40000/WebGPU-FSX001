// three
@binding(2) @group(0) var<uniform> modelMatrix : mat4x4<f32>;
@binding(3) @group(0) var<uniform> viewprojectMatrix : mat4x4<f32>;
@binding(4) @group(0) var<uniform> time : f32;
@binding(0) @group(1) var<uniform> flatElevation : f32;
@binding(1) @group(1) var<uniform> uBigWavesFrequency : vec2<f32>;

struct VertexOutput {
    @builtin(position) Position : vec4<f32>,
    @location(0) fragUV : vec2<f32>,
    @location(1) fragPosition: vec4<f32>,
    @location(2) fragNormal: vec4<f32>,
    @location(3) timeOfFrag: f32,
};
fn hash(n: i32) -> f32 {
    // 一个简单的伪随机哈希函数
    return fract(sin(f32(n) * 43758.5453123));
}

fn perlinNoise(x: f32) -> f32 {
    let x0 = floor(x);
    let x1 = x0 + 1.0;
    let t = x - x0;
    
    let g0 = hash(i32(x0));
    let g1 = hash(i32(x1));
    
    let n0 = mix(g0, g1, t);
    
    return n0;
}

@vertex
fn main(
    @location(0) position : vec3<f32>,
    @location(1) normal : vec3<f32>,
    @location(2) uv : vec2<f32>,
) -> VertexOutput {
    var output : VertexOutput;
    var nosie = perlinNoise(position.z);
    var position_model = modelMatrix * vec4<f32>(position, 1.0);
    // var elevation = sin(position.x * uBigWavesFrequency.x) * flatElevation;
    var elevation = sin(position_model.x * uBigWavesFrequency.x + time)
                    * sin(position_model.z * uBigWavesFrequency.y + time)
                    * flatElevation;
    var pos = vec4(
        position_model.x,
        position_model.y + elevation,
        position_model.z,
        1.0);
    output.Position = viewprojectMatrix * pos;
    output.fragPosition = 0.5 * (vec4<f32>(position, 1.0) + vec4<f32>(1.0, 1.0, 1.0, 1.0));
    output.fragUV = uv;
    output.fragNormal = vec4<f32>(normal.xyz, 1.0);
    output.timeOfFrag = time;
    return output;
}
