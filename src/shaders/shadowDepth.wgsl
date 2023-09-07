@group(0) @binding(0) var<storage> modelMatrix : array<mat4x4<f32>>;
@group(0) @binding(1) var<uniform> lightVPMatrix : mat4x4<f32>;
@group(1) @binding(0) var<uniform> time : f32;
// @group(0) @binding(2) var<uniform> time : f32;
@group(1) @binding(1) var<uniform> flatElevation : f32;
@group(1) @binding(2) var<uniform> uBigWavesFrequency : vec2<f32>;

@vertex
fn main(
    @builtin(instance_index) index : u32,
    @location(0) position : vec3<f32>,
    // @location(1) normal : vec3<f32>,
    // @location(2) uv : vec2<f32>,
) -> @builtin(position) vec4<f32> {
    var position_Shadow: vec4<f32>;
    if(index == 0){
        position_Shadow = lightVPMatrix * modelMatrix[index] * vec4(position, 1.0);
    }else if(index==1){
        var position_model = modelMatrix[index] * vec4(position, 1.0);
        var elevation = sin(position_model.x * uBigWavesFrequency.x + time)
                * sin(position_model.z * uBigWavesFrequency.y + time)
                * flatElevation;
        var pos = vec4(
            position_model.x,
            position_model.y + elevation,
            position_model.z,
            1.0);
        position_Shadow = lightVPMatrix * pos;
    }
    return position_Shadow;
}

        
