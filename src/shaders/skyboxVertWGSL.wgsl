// cubemap
struct ModelMatrix {
  modelMatrix : mat4x4<f32>,
}
struct CameraViewMatrix {
  cameraViewMatrix : mat4x4<f32>,
}

@binding(0) @group(0) var<uniform> modelMatrix : ModelMatrix; //main: uniformBuffer main2: uniformBuffer
@binding(1) @group(0) var<uniform> cameraViewMatrix : CameraViewMatrix; //main: uniformBuffer main2: uniformBuffer


struct VertexOutput {
  @builtin(position) Position : vec4<f32>,
  @location(0) fragUV : vec2<f32>,
  @location(1) fragPosition: vec4<f32>,
}

@vertex
fn main(
  @location(0) position : vec4<f32>,
  @location(1) uv : vec2<f32>
) -> VertexOutput {
  var output : VertexOutput;
  output.Position = cameraViewMatrix.cameraViewMatrix * modelMatrix.modelMatrix * position;
  output.fragUV = uv;
  output.fragPosition = 0.5 * (position + vec4(1.0, 1.0, 1.0, 1.0));
  return output;
}
