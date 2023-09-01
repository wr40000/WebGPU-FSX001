// three
@binding(2) @group(0) var<uniform> modelMatrix : mat4x4<f32>;
@binding(3) @group(0) var<uniform> viewprojectMatrix : mat4x4<f32>;
@binding(4) @group(0) var<uniform> time : f32;

struct VertexOutput {
    @builtin(position) Position : vec4<f32>,
    @location(0) fragUV : vec2<f32>,
    @location(1) fragPosition: vec4<f32>,
    @location(2) fragNormal: vec4<f32>,
    @location(3) timeOfFrag: f32,
};

@vertex
fn main(
    @location(0) position : vec3<f32>,
    @location(1) normal : vec3<f32>,
    @location(2) uv : vec2<f32>,
) -> VertexOutput {
    var output : VertexOutput;
    var size = 1.0;
    var pos = vec4(position.x * size, position.y * size, position.z, 1.0);
    output.Position = viewprojectMatrix * modelMatrix * pos;
    output.fragPosition = 0.5 * (vec4<f32>(position, 1.0) + vec4<f32>(1.0, 1.0, 1.0, 1.0));
    output.fragUV = uv;
    output.fragNormal = viewprojectMatrix * modelMatrix * vec4<f32>(normal.xyz, 1.0);
    output.timeOfFrag = time;
    return output;
}
