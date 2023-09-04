@group(0) @binding(0) var<uniform> lightVPMatrix : mat4x4<f32>;
@group(0) @binding(1) var<uniform> threeModelMatrix : mat4x4<f32>;

@vertex
fn main(
    @location(0) position : vec3<f32>,
    @location(1) normal : vec3<f32>,
    @location(2) uv : vec2<f32>,
) -> @builtin(position) vec4<f32> {
    let pos = vec4(position, 1.0);
    return lightVPMatrix * threeModelMatrix * pos;
}
