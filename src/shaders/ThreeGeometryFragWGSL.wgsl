@binding(3) @group(0) var Texture: texture_2d<f32>;
@binding(4) @group(0) var Sampler: sampler;

@fragment
fn main(
    @location(0) fragUV : vec2<f32>,
    @location(1) fragPosition: vec4<f32>,
    @location(2) fragNormal: vec4<f32>,
    @location(3) timeOfFrag: f32,
) -> @location(0) vec4<f32> {
    // return fragPosition;
    return vec4<f32>(
        fragPosition.x * timeOfFrag,
        fragPosition.y * timeOfFrag,
        fragPosition.z,
        1.0
        );
}