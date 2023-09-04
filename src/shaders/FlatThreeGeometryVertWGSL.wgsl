// three
@binding(0) @group(0) var<uniform> cameraPosition : mat4x4<f32>;
@binding(1) @group(0) var<uniform> lightProjection : mat4x4<f32>;
@binding(2) @group(0) var<uniform> modelMatrix : mat4x4<f32>;
@binding(3) @group(0) var<uniform> viewprojectMatrix : mat4x4<f32>;
@binding(4) @group(0) var<uniform> time : f32;
@binding(0) @group(1) var<uniform> flatElevation : f32;
@binding(1) @group(1) var<uniform> uBigWavesFrequency : vec2<f32>;

struct VertexOutput {
    @builtin(position) Position : vec4<f32>,
    @location(0) fragUV : vec2<f32>,
    @location(1) fragPosition: vec4<f32>,
    @location(2) fragNormal: vec3<f32>,
    @location(3) timeOfFrag: f32,
    @location(4) shadowPos: vec3<f32>,
};

@vertex
fn main(
    @location(0) position : vec3<f32>,
    @location(1) normal : vec3<f32>,
    @location(2) uv : vec2<f32>,
) -> VertexOutput {
    var output : VertexOutput;
    var position_model = modelMatrix * vec4<f32>(position, 1.0);
    // var elevation = sin(position.x * uBigWavesFrequency.x) * flatElevation;
    var elevation = sin(position_model.x * uBigWavesFrequency.x + time)
                    * sin(position_model.z * uBigWavesFrequency.y + time)
                    * flatElevation;
    var pos = vec4(
        position_model.x,
        position_model.y + elevation,
        position_model.z,
        1.0);
    let posFromCamera = viewprojectMatrix * pos;
    output.Position = posFromCamera;
    output.fragPosition = modelMatrix * pos;
    output.fragUV = uv;
    output.fragNormal = (modelMatrix * vec4<f32>(normal, 0.0)).xyz;
    output.timeOfFrag = time;

    let posFromLight: vec4<f32> = lightProjection * modelMatrix * pos;
// Convert shadowPos XY to (0, 1) to fit texture UV
    output.shadowPos = vec3<f32>(posFromLight.xy * vec2<f32>(0.5, -0.5)
                     + vec2<f32>(0.5, 0.5), posFromLight.z);
    return output;
}
