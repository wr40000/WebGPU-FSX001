import './style.css'
import { mat4, vec2, vec3, vec4 } from "webgpu-matrix"
import initWebGPU from './util/initWebGPU'
import initSkyBox from './util/skybox'
import Camera from './control/camera'
import initThreeMesh from './util/THREEMESH'
import initLayout from './util/Layout'
import ThreeGeometryFragWGSL from "./shaders/ThreeGeometryFragWGSL.wgsl?raw"
import ThreeGeometryVertWGSL from "./shaders/ThreeGeometryVertWGSL.wgsl?raw"
import FlatThreeGeometryFragWGSL from "./shaders/FlatThreeGeometryFragWGSL.wgsl?raw"
import FlatThreeGeometryVertWGSL from "./shaders/FlatThreeGeometryVertWGSL.wgsl?raw"
import {GUIForthreeGeometry, GUIForFlatthreeGeometry, initUNIFORM, particlePointNUM}  from './util/const'
import {stats, threeGeometryAttributes, threeGeometry, flat, particlesPoint, particlesPointAttr} from './util/GUI'
import {initParticlesGalaxy} from './util/particlesGalaxy'
import {initParticlesPoint} from './util/particlesPoint'

async function run(){
  const canvas = document.querySelector('canvas') as HTMLCanvasElement
  if (!canvas)
      throw new Error('No Canvas')
  const uniformBufferSize = 4 * 16; // 4x4 matrix
  const {device, context, format, size, depthTexture, depthView} = await initWebGPU(canvas)

  // 相机
  const camera = new Camera(canvas, Math.PI / 6, 0.1, 100000, 0.05);

  // uniformBuffer
  // #region
  const {
          timeFrameDeferenceBuffer,
          flatElevationBuffer,
          flatBigWavesFrequencyBuffer,
          cameraVPMatrixBuffer,
          cubeTextureImg,
          particlesTextureImg,          
        } = await initUNIFORM(device)

  const cubeTexture = device.createTexture({
    size: [canvas.width, canvas.height],
    // size: [512, 512],
    format,
    // mipLevelCount:5,
    // sampleCount:4,
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
  });
  
  const depthObj = {
    depthTexture, depthView, cubeTexture
  }
  // #endregion

  // Layout
  const {
    SkyBoxBindGroupLayout,
    SkyBoxPipelineLayout,
    initThreeGeometryBindingGroupLayout,
    initThreeGeometryPipelineLayout,
    initflatThreeGeometryBindingGroupLayout1,
    initflatThreeGeometryBindingGroupLayout2,
    initflatThreeGeometryPipelineLayout
  } = initLayout(device);

  // skybox
  const SkyBoxObj = await initSkyBox(
    device,
    format,
    canvas,
    SkyBoxPipelineLayout)
  const SkyBoxBindingGroup = device.createBindGroup({
    label: 'SkyBoxBindingGroup',
    layout: SkyBoxBindGroupLayout,
    entries: [
      {
        binding: 0,
        resource: {
          buffer: SkyBoxObj.skyBoxModelMatrixBuffer,
          offset: 0,
          size: uniformBufferSize,
        },
      },
      {
        binding: 1,
        resource: {
          buffer: cameraVPMatrixBuffer,
          offset: 0,
          size: uniformBufferSize,
        },
      },
      {
        binding: 2,
        resource: SkyBoxObj.sampler,
      },
      {
        binding: 3,
        resource: SkyBoxObj.skyBoxmapTexture.createView({
          dimension: "cube",
        }),
      },
    ]
  })

  // Three Geometry
  // #region

  // BoxGeometry CapsuleGeometry CircleGeometry ConeGeometry CylinderGeometry 
  // PlaneGeometry RingGeometry ShapeGeometry SphereGeometry TorusGeometry TorusKnotGeometry TubeGeometry
  // 调用initThreeMesh  更新ThreeGeometry 
  const updateThreeMesh = async () => {
    const { ThreeGeometryPipeline,
            vertexindexFromThree,
            vertexBufferFromThree,
            arrayFromThreeIndexCount }
             = await initThreeMesh(device,
                                  format,
                                  initThreeGeometryPipelineLayout,
                                  'BoxGeometry',
                                  ThreeGeometryVertWGSL,
                                  ThreeGeometryFragWGSL,
                                  GUIForthreeGeometry);
  return  { ThreeGeometryPipeline,
            vertexindexFromThree,
            vertexBufferFromThree,
            arrayFromThreeIndexCount }                                                     
  };
  let { ThreeGeometryPipeline,
        vertexindexFromThree,
        vertexBufferFromThree,
        arrayFromThreeIndexCount }  = await updateThreeMesh();
  // gui ThreeGeometry
  threeGeometry.add(GUIForthreeGeometry, 'topologyIsline_list').onChange(async ()=>{
    const updatedValues = await updateThreeMesh();
    // 在 Promise 解决后更新变量的值
    ThreeGeometryPipeline = updatedValues.ThreeGeometryPipeline
  });         
      
  // 调用initThreeMesh  更新flatThreeGeometry                                                
  const updateFlatThreeMesh = async () => {
    const {ThreeGeometryPipeline: flatThreeGeometryPipeline,
      vertexindexFromThree: flatVertexindexFromThree,
      vertexBufferFromThree: flatVertexBufferFromThree,
      arrayFromThreeIndexCount: flatArrayFromThreeIndexCount
    } = await initThreeMesh(device,
                            format,
                            initflatThreeGeometryPipelineLayout,
                            'PlaneGeometry',
                            FlatThreeGeometryVertWGSL,
                            FlatThreeGeometryFragWGSL,
                            GUIForFlatthreeGeometry);
  return  { flatThreeGeometryPipeline,
            flatVertexindexFromThree,
            flatVertexBufferFromThree,
            flatArrayFromThreeIndexCount }                                                     
  };
  let { flatThreeGeometryPipeline,
        flatVertexindexFromThree,
        flatVertexBufferFromThree,
        flatArrayFromThreeIndexCount }  = await updateFlatThreeMesh(); 
  // GUI flatThreeGeometry
  flat.add(GUIForFlatthreeGeometry, 'topologyIsline_list').onChange(async ()=>{
    const updatedValues = await updateFlatThreeMesh();
    // 在 Promise 解决后更新变量的值
    flatThreeGeometryPipeline = updatedValues.flatThreeGeometryPipeline
  });                      
  // 模型变换矩阵
  // #region
  // three Geometry
  const threeGeometryModelMatrix = mat4.identity();
  mat4.translate(threeGeometryModelMatrix, vec3.create(0, 0, -10),threeGeometryModelMatrix)
  mat4.scale(threeGeometryModelMatrix, vec3.create(1, 1, 1), threeGeometryModelMatrix)
  const threeGeometryModelMatrixBuffer = device.createBuffer({
    label: 'threeGeometryModelMatrixBuffer',
    size: uniformBufferSize,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
    mappedAtCreation: true
  })
  new Float32Array(threeGeometryModelMatrixBuffer.getMappedRange()).set(threeGeometryModelMatrix as Float32Array);
  threeGeometryModelMatrixBuffer.unmap();

  // flat 模型变换矩阵
  const flatThreeGeometryModelMatrix = mat4.identity();
  mat4.translate(flatThreeGeometryModelMatrix, vec3.create(0, -3, -10),flatThreeGeometryModelMatrix)
  mat4.rotateX(flatThreeGeometryModelMatrix, -Math.PI/2, flatThreeGeometryModelMatrix)
  mat4.scale(flatThreeGeometryModelMatrix,
             vec3.create(threeGeometryAttributes.scaleOfFlat.value[0], threeGeometryAttributes.scaleOfFlat.value[1], 0.1),
             flatThreeGeometryModelMatrix)
  const flatThreeGeometryModelMatrixBuffer = device.createBuffer({
    label: 'flatThreeGeometryModelMatrix',
    size: uniformBufferSize,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
    mappedAtCreation: true
  })
  new Float32Array(flatThreeGeometryModelMatrixBuffer.getMappedRange()).set(flatThreeGeometryModelMatrix as Float32Array);
  flatThreeGeometryModelMatrixBuffer.unmap();
  // #endregion
  
  // three Geometry 资源绑定
  // #region
  const threeGeometryBindingGroup1 = device.createBindGroup({
    label: 'threeGeometryBindingGroup1',
    layout:initThreeGeometryBindingGroupLayout,
    entries: [
      {
        binding: 0,
        resource: cubeTexture.createView(),
      },
      {
        binding: 1,
        resource: SkyBoxObj.sampler,
      },
      {
        binding: 2,
        resource: {
          buffer: threeGeometryModelMatrixBuffer
        }
      },
      {
        binding: 3,
        resource: {
          buffer: cameraVPMatrixBuffer
        }
      },
      {
        binding: 4,
        resource: {
          buffer: timeFrameDeferenceBuffer
        }
      },
    ]
  })
  // flat
  const flatThreeGeometryBindingGroup1 = device.createBindGroup({
    label: 'flatThreeGeometryBindingGroup1',
    layout:initflatThreeGeometryBindingGroupLayout1,
    entries: [
      {
        binding: 2,
        resource: {
          buffer: flatThreeGeometryModelMatrixBuffer
        }
      },
      {
        binding: 3,
        resource: {
          buffer: cameraVPMatrixBuffer
        }
      },
      {
        binding: 4,
        resource: {
          buffer: timeFrameDeferenceBuffer
        }
      },
    ]
  })
  const flatThreeGeometryBindingGroup2 = device.createBindGroup({
    label: 'flatThreeGeometryBindingGroup2',
    layout:initflatThreeGeometryBindingGroupLayout2,
    entries: [
      {
        binding: 0,
        resource: {
          buffer: flatElevationBuffer
        }
      },
      {
        binding: 1,
        resource: {
          buffer: flatBigWavesFrequencyBuffer
        }
      },
      {
        binding: 2,
        resource: cubeTextureImg.createView()
      },
    ]
  })
  // #endregion

  // #endregion


  // ParticlesGalaxy
  // #region
  const NUM = 1;
  const particleObj = await initParticlesGalaxy(device, canvas, format, NUM);
  
  const particlesBindingGroup = device.createBindGroup({
    label: 'particlesBindingGroup',
    layout: particleObj.particlesGalaxyBindingGroupLayout,
    entries:[
      {
        binding: 0,
        resource: {
          buffer:particleObj.particlesModelBuffer,
          offset: 0,
          size: NUM * 4 * 4 * 4
        }
      },
      {
        binding: 1,
        resource: {
          buffer:cameraVPMatrixBuffer,
          offset: 0,
          size: uniformBufferSize
        }
      },
      {
        binding: 2,
        resource: {
          buffer: timeFrameDeferenceBuffer
        }
      },
      {
        binding: 3,
        resource: particlesTextureImg.createView(),
      },
      {
        binding: 4,
        resource: SkyBoxObj.sampler,
      },
    ]
  })           
  // #endregion
  
  // ParticlesPoint
  // #region
  const particlesPointObj = await initParticlesPoint(device, format, particlesPointAttr.range[0]);
  const PointAttr = {radius: 2}
  particlesPoint.add(particlesPointAttr.range, '0').min(10000).max(500000).step(10000).onChange(()=>{
    const particlesModelArray = new Float32Array(particlesPointAttr.range[0] * 4 * 4);
    console.time("writerBuffer Particles Point")
    for( let i = 0; i < particlesPointAttr.range[0]; i++){
         // 生成随机的角度（0 到 2π）
        const angle = Math.random() * Math.PI * 2;
        // 生成随机的半径（0 到 5）
        const radius = Math.random() * PointAttr.radius;

        const particlesPositionMatrix = mat4.identity();
        const xOffset = radius * Math.cos(angle) - 1;
        const yOffset = (Math.random() - 0.5) * 0.2 * - 1;
        const zOffset = radius * Math.sin(angle)-3;
        mat4.translate(particlesPositionMatrix,[xOffset, yOffset, zOffset], particlesPositionMatrix)
        particlesModelArray.set(particlesPositionMatrix as Float32Array, i * 4 * 4)
    }
    console.timeEnd("writerBuffer Particles Point")
    device.queue.writeBuffer(
      particlesPointObj.particlesModelBuffer,
      0,
      particlesModelArray
    )
  });
  particlesPoint.add(PointAttr, 'radius').min(0.2).max(2).step(0.0001).onChange(()=>{
    const particlesModelArray = new Float32Array(particlesPointAttr.range[0] * 4 * 4);
    console.time("writerBuffer Particles Point")
    for( let i = 0; i < particlesPointAttr.range[0]; i++){
         // 生成随机的角度（0 到 2π）
        const angle = Math.random() * Math.PI * 2;
        // 生成随机的半径（0 到 5）
        const radius = Math.random() * PointAttr.radius;

        const particlesPositionMatrix = mat4.identity();
        const xOffset = radius * Math.cos(angle) - 1;
        const yOffset = (Math.random() - 0.5) * 0.2 * - 1;
        const zOffset = radius * Math.sin(angle) - 3;
        mat4.translate(particlesPositionMatrix,[xOffset, yOffset, zOffset], particlesPositionMatrix)
        particlesModelArray.set(particlesPositionMatrix as Float32Array, i * 4 * 4)
    }
    console.timeEnd("writerBuffer Particles Point")
    device.queue.writeBuffer(
      particlesPointObj.particlesModelBuffer,
      0,
      particlesModelArray
    )
  });

  const particlesPointBindingGroup = device.createBindGroup({
    label: 'particlesBindingGroup',
    layout: particlesPointObj.particlesPointBindingGroupLayout,
    entries: [
      // {
      //   binding: 0,
      //   resource: {
      //     buffer: particlesPointObj.particlesModelBuffer
      //   }
      // },
      // {
      //   binding: 1,
      //   resource: {
      //     buffer: cameraVPMatrixBuffer
      //   }
      // },
      {
        binding: 0,
        resource: {
          buffer: particlesPointObj.particlesPointMVPMatrixBuffer
        }
      },
    ]
  })
  const particlesPointComputeBindingGroup = device.createBindGroup({
    label: 'particlesPointComputeBindingGroup',
    layout: particlesPointObj.computeParticlesPointBindingGroupLayout,
    entries: [
      {
        binding: 0,
        resource: {
          buffer: particlesPointObj.inputBuffer
        }
      },
      {
        binding: 1,
        resource: {
          buffer: particlesPointObj.velocityBuffer
        }
      },
      {
        binding: 2,
        resource: {
          buffer: particlesPointObj.particlesModelBuffer
        }
      },
      {
        binding: 3,
        resource: {
          buffer: cameraVPMatrixBuffer
        }
      },
      {
        binding: 4,
        resource: {
          buffer: particlesPointObj.particlesPointMVPMatrixBuffer
        }
      },
    ]
  })
  // #endregion
  
  let timeOfLastframe = performance.now();
  function frame(){    
    // 更新帧数
    stats.update()
    // 调节帧率流畅
    let timeOfNowframe = performance.now();
    let timeOfdifference = (timeOfNowframe - timeOfLastframe) / 30;
    timeOfLastframe = timeOfNowframe;
    mat4.rotateX(threeGeometryModelMatrix, timeOfdifference/threeGeometryAttributes.rotateSpeed, threeGeometryModelMatrix)
    mat4.rotateY(threeGeometryModelMatrix, timeOfdifference/threeGeometryAttributes.rotateSpeed, threeGeometryModelMatrix)
    mat4.rotateZ(threeGeometryModelMatrix, timeOfdifference/threeGeometryAttributes.rotateSpeed, threeGeometryModelMatrix)
    
    // 缓冲区写操作-颜色 频率
    // #region
    // 颜色频率
    device.queue.writeBuffer(
      timeFrameDeferenceBuffer,
      0,
      // new Float32Array([Math.abs(Math.sin(timeOfNowframe))])记得加[]
      new Float32Array([Math.abs(Math.sin(threeGeometryAttributes.colorFrequency * timeOfNowframe))])
    )
    device.queue.writeBuffer(
      flatElevationBuffer,
      0,
      new Float32Array([threeGeometryAttributes.Elevation])
    )
    device.queue.writeBuffer(
      flatBigWavesFrequencyBuffer,
      0,
      new Float32Array([threeGeometryAttributes.uBigWavesFrequency.value[0],threeGeometryAttributes.uBigWavesFrequency.value[1]])
    )
    // #endregion

    // 缓冲区写操作-模型变换矩阵
    // #region
    device.queue.writeBuffer(
      threeGeometryModelMatrixBuffer, 0, threeGeometryModelMatrix
    )

    // 根据GUI更新flat模型变换矩阵
    const flatThreeGeometryModelMatrix = mat4.identity();
    mat4.translate(flatThreeGeometryModelMatrix, vec3.create(0, -3, -10),flatThreeGeometryModelMatrix)
    mat4.rotateX(flatThreeGeometryModelMatrix, -Math.PI/2, flatThreeGeometryModelMatrix)
    mat4.scale(flatThreeGeometryModelMatrix,
               vec3.create(threeGeometryAttributes.scaleOfFlat.value[0], threeGeometryAttributes.scaleOfFlat.value[1], 0.1),
               flatThreeGeometryModelMatrix)
    device.queue.writeBuffer(
      flatThreeGeometryModelMatrixBuffer, 0, flatThreeGeometryModelMatrix as Float32Array
    )     
    // #endregion

    // 更新相机位置 以及 更新相机内置的canvas宽高，否则resize失效
    // #region
    camera.recalculateProjection(); // 更新相机内置的canvas宽高
    camera.updatePos();
    const cameraVPMatrix = mat4.create();
    mat4.multiply(camera.projection, camera.view, cameraVPMatrix);
    const CameraVPMatrixArray = new Float32Array(cameraVPMatrix);
    
    device.queue.writeBuffer(
      cameraVPMatrixBuffer,
      0,
      CameraVPMatrixArray.buffer,
      CameraVPMatrixArray.byteOffset,
      CameraVPMatrixArray.byteLength
    );
    // #endregion

    const commandEncoder = device.createCommandEncoder();
    // 更新  出错  
    // 管线
    // #region
    // skyBoxRenderPassDescriptor.colorAttachments[0].view = context.getCurrentTexture().createView();
    const skyBoxRenderPassDescriptor: GPURenderPassDescriptor = {
      colorAttachments: [
        {
          view: context.getCurrentTexture().createView(), // Assigned later
          loadOp: "clear",
          storeOp: "store",
          clearValue: { r: 0.0, g: 0, b: 0, a: 1.0 },
        },
      ],
      depthStencilAttachment: {
        view: depthObj.depthView,
        depthClearValue: 1.0,
        depthLoadOp: "clear",
        depthStoreOp: "store",
      },
    };

    const computePass = commandEncoder.beginComputePass()
    {
      computePass.setPipeline(particlesPointObj.particlesPointComputePipeLine)
      computePass.setBindGroup(0, particlesPointComputeBindingGroup);
      computePass.dispatchWorkgroups(Math.ceil(particlesPointAttr.range[0] / 128))
      computePass.end()
    }

    const passEncoder = commandEncoder.beginRenderPass(skyBoxRenderPassDescriptor);
    // 天空盒管线     
    {        
      passEncoder.setPipeline(SkyBoxObj.skyBoxPipeline);
      passEncoder.setVertexBuffer(0, SkyBoxObj.skyBoxVerticesBuffer);
      passEncoder.setBindGroup(0, SkyBoxBindingGroup);
      passEncoder.draw(SkyBoxObj.cubeVertexCount, 1, 0, 0);
    }

    // Three Geometry 管线
    {
      passEncoder.setPipeline(ThreeGeometryPipeline);
      passEncoder.setVertexBuffer(0, vertexBufferFromThree);
      passEncoder.setIndexBuffer(vertexindexFromThree, 'uint16');
      passEncoder.setBindGroup(0, threeGeometryBindingGroup1);
      passEncoder.setBindGroup(1, flatThreeGeometryBindingGroup2);
      passEncoder.drawIndexed(arrayFromThreeIndexCount)
    }
    // Three flat Geometry 管线
    {
      passEncoder.setPipeline(flatThreeGeometryPipeline);
      passEncoder.setVertexBuffer(0, flatVertexBufferFromThree);
      passEncoder.setIndexBuffer(flatVertexindexFromThree, 'uint16');
      passEncoder.setBindGroup(0, flatThreeGeometryBindingGroup1);
      passEncoder.setBindGroup(1, flatThreeGeometryBindingGroup2);
      passEncoder.drawIndexed(flatArrayFromThreeIndexCount)
    }
    //  银河粒子管线
    {
      passEncoder.setPipeline(particleObj.particlesGalaxyPipeLine);
      passEncoder.setVertexBuffer(0, particleObj.particlesVertexBuffer);
      passEncoder.setIndexBuffer(particleObj.particlesVertexIndexBuffer, 'uint16');
      passEncoder.setBindGroup(0, particlesBindingGroup);
      passEncoder.drawIndexed(particleObj.sphereCount, NUM)
    }
    //  点粒子管线
    {
      passEncoder.setPipeline(particlesPointObj.particlesPointPipeLine);
      passEncoder.setVertexBuffer(0, particlesPointObj.particlesVertexBuffer);
      passEncoder.setBindGroup(0, particlesPointBindingGroup);
      passEncoder.drawIndexed(1, particlesPointAttr.range[0] )
    }
    // #endregion

    passEncoder.end();

    // 将渲染结果从交换链复制到|cubeTexture|中。
    commandEncoder.copyTextureToTexture(
      {
        texture: context.getCurrentTexture(),
      },
      {
        texture: depthObj.cubeTexture,
      },
      [canvas.width, canvas.height]
    );

    device.queue.submit([commandEncoder.finish()]);
    requestAnimationFrame(frame)
  }
  frame()

  // re-configure context on resize
  window.addEventListener('resize', ()=>{   
      size.width = canvas.width = canvas.clientWidth * devicePixelRatio
      size.height = canvas.height = canvas.clientHeight * devicePixelRatio
      
      // don't need to recall context.configure() after v104
      // re-create depth texture
      depthObj.depthTexture.destroy();

      depthObj.depthTexture = device.createTexture({
        size, format: 'depth32float',
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
      });

      depthObj.depthView = depthObj.depthTexture.createView();
  })
}
run()