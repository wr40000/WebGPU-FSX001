@fragment
fn main(
  @location(0) fragPosition: vec4<f32>,
  @location(1) fragColor: vec4<f32>,
) -> @location(0) vec4<f32> {
    return vec4<f32>(
      sin(fragPosition.x),
      cos(fragPosition.y),
      sin(fragPosition.z),
      1.0
    );
}