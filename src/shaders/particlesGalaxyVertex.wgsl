struct CameraViewProjectMatrix {
  cameraViewProjectMatrix : mat4x4<f32>,
}

@binding(0) @group(0) var<storage> modelMatrix : array<mat4x4<f32>>;
@binding(1) @group(0) var<uniform> cameraViewProjectMatrix : CameraViewProjectMatrix;
@binding(2) @group(0) var<uniform> time : f32;


struct VertexOutput {
  @builtin(position) Position : vec4<f32>,
  @location(0) fragUV : vec2<f32>,
  @location(1) fragPosition: vec4<f32>,
  @location(2) fragNormal: vec4<f32>,
  @location(3) fragTime: f32,
}

@vertex
fn main(
  @builtin(instance_index) index: u32,
  @location(0) position : vec3<f32>,
  @location(1) normal : vec3<f32>,
  @location(2) uv : vec2<f32>
) -> VertexOutput {
  var output : VertexOutput;
  output.Position = cameraViewProjectMatrix.cameraViewProjectMatrix * modelMatrix[index] * vec4<f32>(position, 1.0);
  output.fragUV = uv;
  output.fragPosition = 0.5 * (vec4<f32>(position, 1.0) + vec4(1.0, 1.0, 1.0, 1.0));
  output.fragNormal = vec4<f32>(normal, 1.0);
  output.fragTime = time;
  return output;
}
