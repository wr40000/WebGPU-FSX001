// cubemap
@group(0) @binding(2) var mySampler: sampler;
@group(0) @binding(3) var myTexture: texture_cube<f32>;

@fragment
fn main(
  @location(0) fragUV: vec2<f32>,
  @location(1) fragPosition: vec4<f32>
) -> @location(0) vec4<f32> {
  // Our camera and the skybox cube are both centered at (0, 0, 0)
  // so we can use the cube geomtry position to get viewing vector to sample the cube texture.
  // The magnitude of the vector doesn't matter.
  //我们的相机和skybox立方体都以（0，0，0）为中心
  //因此，我们可以使用立方体的地理位置来获得观看向量来对立方体纹理进行采样。
  //矢量的大小无关紧要。
  var cubemapVec = fragPosition.xyz - vec3(0.5);
  return textureSample(myTexture, mySampler, cubemapVec);
}
