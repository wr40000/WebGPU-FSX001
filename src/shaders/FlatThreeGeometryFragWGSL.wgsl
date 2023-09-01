@fragment
fn main(
    @location(0) fragUV : vec2<f32>,
    @location(1) fragPosition: vec4<f32>,
    @location(2) fragNormal: vec4<f32>,
    @location(3) timeOfFrag: f32,
) -> @location(0) vec4<f32> {
    return vec4<f32>(0.5, 0.8, 1.0, 1.0);
}