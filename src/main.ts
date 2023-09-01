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
import {GUIForthreeGeometry, GUIForFlatthreeGeometry, initUNIFORM}  from './util/const'
import {stats, threeGeometryAttributes, threeGeometry, flat} from './util/GUI'


async function run(){
  const canvas = document.querySelector('canvas') as HTMLCanvasElement
  if (!canvas)
      throw new Error('No Canvas')
  const uniformBufferSize = 4 * 16; // 4x4 matrix
  const {device, context, format, size, depthTexture, depthView} = await initWebGPU(canvas)

  const depthObj = {
    depthTexture, depthView
  }

  // 相机
  const camera = new Camera(canvas, Math.PI / 6, 0.1, 100000, 0.05);

  // uniformBuffer
  // #region
  const {
          timeFrameDeferenceBuffer,
          flatElevationBuffer,
          flatBigWavesFrequencyBuffer,
          cameraVPMatrixBuffer
        } = initUNIFORM(device)
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
  // #region
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
  // const skyBoxRenderPassDescriptor: GPURenderPassDescriptor = {
  //   colorAttachments: [
  //     {
  //       view: undefined, // Assigned later
  //       loadOp: "clear",
  //       storeOp: "store",
  //       clearValue: { r: 0.0, g: 0, b: 0, a: 1.0 },
  //     },
  //   ],
  //   depthStencilAttachment: {
  //     view: depthObj.depthView,
  //     depthClearValue: 1.0,
  //     depthLoadOp: "clear",
  //     depthStoreOp: "store",
  //   },
  // };
  // #endregion

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
                                  'CapsuleGeometry',
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
    // vertexindexFromThree = updatedValues.vertexindexFromThree
    // vertexBufferFromThree = updatedValues.vertexBufferFromThree
    // arrayFromThreeIndexCount = updatedValues.arrayFromThreeIndexCount
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
  // mat4.rotateX(threeGeometryModelMatrix, Math.PI/6, threeGeometryModelMatrix)
  // mat4.rotateY(threeGeometryModelMatrix, Math.PI/6, threeGeometryModelMatrix)
  // mat4.rotateZ(threeGeometryModelMatrix, Math.PI/6, threeGeometryModelMatrix)
  mat4.scale(threeGeometryModelMatrix, vec3.create(1, 1, 1), threeGeometryModelMatrix)
  // mat4.scale(threeGeometryModelMatrix, vec3.create(0.1, 0.1, 0.1), threeGeometryModelMatrix)
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
        resource: {
          buffer: vertexBufferFromThree
        }
      },
      {
        binding: 1,
        resource: {
          buffer: vertexindexFromThree
        }
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
        binding: 0,
        resource: {
          buffer: vertexBufferFromThree
        }
      },
      {
        binding: 1,
        resource: {
          buffer: vertexindexFromThree
        }
      },
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
    ]
  })
  // #endregion

  // #endregion

  let timeOfLastframe = performance.now();
  let i = 1;
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
    i = i + 1;
    if(++i % 60 == 0){        
    }
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
    // #endregion

    passEncoder.end();
    device.queue.submit([commandEncoder.finish()]);

    requestAnimationFrame(frame)
  }
  frame()

  // re-configure context on resize
  window.addEventListener('resize', ()=>{
    console.log('resize');    
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