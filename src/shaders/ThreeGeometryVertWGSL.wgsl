// three
@binding(2) @group(0) var<uniform> modelMatrix : mat4x4<f32>;
@binding(3) @group(0) var<uniform> viewprojectMatrix : mat4x4<f32>;
@binding(4) @group(0) var<uniform> time : f32;
@binding(5) @group(0) var<uniform> cameraPosition : mat4x4<f32>;
@binding(6) @group(0) var<uniform> lightProjection : mat4x4<f32>;
@binding(7) @group(0) var<uniform> shaderAttr : mat4x4<f32>;
@group(0) @binding(10) var<uniform> cameraPos : vec4<f32>;
struct VertexOutput {
    @builtin(position) Position : vec4<f32>,
    @location(0) fragUV : vec2<f32>,
    @location(1) fragPosition: vec3<f32>,
    @location(2) fragNormal: vec3<f32>,
    @location(3) timeOfFrag: f32,
    @location(4) shadowPos: vec3<f32>,
    @location(5) chooseFragmentAttr1: vec4<f32>,
    @location(6) chooseFragmentAttr2: vec4<f32>,
    @location(7) chooseFragmentAttr3: vec4<f32>,
    @location(8) chooseFragmentAttr4: vec4<f32>,
    @location(9) cameraPos_: vec4<f32>
};

@vertex
fn main(
    @location(0) position : vec3<f32>,
    @location(1) normal : vec3<f32>,
    @location(2) uv : vec2<f32>,
) -> VertexOutput {
    var output : VertexOutput;
    var size = 1.0;
    var pos = vec4(position.x * size, position.y * size, position.z, 1.0);
    output.Position = viewprojectMatrix * modelMatrix * pos;
    // 每个片元的世界坐标，用以计算光源
    output.fragPosition = (modelMatrix * pos).xyz;
    output.fragUV = uv;
    // w分量为0 ，为了移除平移的影响  
    // 没有考虑非等比缩放  --正规矩阵
    // output.fragNormal = (modelMatrix * vec4<f32>(normal, 0.0)).xyz;
    // chatGPT: 在变换后对 output.fragNormal 进行归一化，以解决非等比缩放
    output.fragNormal = normalize((modelMatrix * vec4<f32>(normal, 0.0)).xyz);
    output.timeOfFrag = time;
    output.chooseFragmentAttr1 = shaderAttr[0]; 
    output.chooseFragmentAttr2 = shaderAttr[1];
    output.chooseFragmentAttr3 = shaderAttr[2];
    output.chooseFragmentAttr4 = shaderAttr[3];
    output.cameraPos_ = cameraPos;

    let posFromLight: vec4<f32> = lightProjection * modelMatrix * vec4<f32>(position, 1.0);
    // Convert shadowPos XY to (0, 1) to fit texture UV
    output.shadowPos = vec3<f32>(posFromLight.xy * vec2<f32>(0.5, -0.5)
                     + vec2<f32>(0.5, 0.5), posFromLight.z);

    return output;
}
