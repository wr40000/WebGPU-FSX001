@group(0) @binding(0) var<storage> modelMatrix : array<mat4x4<f32>>;
@group(0) @binding(1) var<uniform> lightVPMatrix : mat4x4<f32>;

@vertex
fn main(
    @builtin(instance_index) index : u32,
    @location(0) position : vec3<f32>,
    // @location(1) normal : vec3<f32>,
    // @location(2) uv : vec2<f32>,
) -> @builtin(position) vec4<f32> {
    let pos = lightVPMatrix * modelMatrix[index] * vec4(position, 1.0);
    return pos;
}

        
