@binding(3) @group(0) var particlesImg : texture_2d<f32>;
@binding(4) @group(0) var particlesSampler : sampler;

@fragment
fn main(
  @location(0) fragUV : vec2<f32>,
  @location(1) fragPosition: vec4<f32>,
  @location(2) fragNormal: vec4<f32>,
  @location(3) fragTime: f32,
) -> @location(0) vec4<f32> {
  // return textureSample(particlesImg, particlesSampler, fragUV);

  return vec4(
    fragPosition.x * sin(fragTime*4),
    fragPosition.y * cos(fragTime*4),
    fragTime,
    1.0);
}