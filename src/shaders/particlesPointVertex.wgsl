// 注意storage, read
@binding(0) @group(0) var<storage, read> mvpMatrix : array<mat4x4<f32>>;
@binding(1) @group(0) var<storage> pointColor : array<vec4<f32>>;


struct VertexOutput {
  @builtin(position) Position : vec4<f32>,
  @location(0) fragPosition: vec4<f32>,
  @location(1) fragColor: vec4<f32>,
}

@vertex
fn main(
  @builtin(instance_index) index: u32,
  @location(0) position : vec3<f32>,
  @location(1) color : vec3<f32>,
) -> VertexOutput {
  var output : VertexOutput;
  var pos = mvpMatrix[index] * vec4<f32>(position, 1.0);
  output.Position = pos;
  output.fragPosition = pos;
  output.fragColor = pointColor[index];
  return output;
}

