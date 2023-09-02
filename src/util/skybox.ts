import { mat4, vec3 } from "webgpu-matrix";
import {
    cubeVertexArray,
    cubeVertexSize,
    cubeUVOffset,
    cubePositionOffset,
    cubeVertexCount,
  } from "../meshes/cube";
import skyboxVertWGSL from "../shaders/skyboxVertWGSL.wgsl?raw";
import skyboxFragWGSL from "../shaders/skyboxFragWGSL.wgsl?raw";

export default async function initSkyBox(
        device:GPUDevice,
        format:GPUTextureFormat,
        canvas:HTMLCanvasElement,
        initSkyBoxPipelineLayout: GPUPipelineLayout

    ){
    // Create a vertex buffer from the cube data.
    const skyBoxVerticesBuffer = device.createBuffer({
        size: cubeVertexArray.byteLength,
        usage: GPUBufferUsage.VERTEX,
        mappedAtCreation: true,
    });

    new Float32Array(skyBoxVerticesBuffer.getMappedRange()).set(cubeVertexArray);
    skyBoxVerticesBuffer.unmap();
    
    const skyBoxPipeline = device.createRenderPipeline({
    label: "pipeline",
    // layout: "auto",
    layout: initSkyBoxPipelineLayout,
    vertex: {
        module: device.createShaderModule({
        code: skyboxVertWGSL,
        }),
        entryPoint: "main",
        buffers: [
        {
            arrayStride: cubeVertexSize,
            attributes: [
            {
                // position
                shaderLocation: 0,
                offset: cubePositionOffset,
                format: "float32x4",
            },
            {
                // uv
                shaderLocation: 1,
                offset: cubeUVOffset,
                format: "float32x2",
            },
            ],
        },
        ],
    },
    fragment: {
        module: device.createShaderModule({
        code: skyboxFragWGSL,
        }),
        entryPoint: "main",
        targets: [
        {
            format: format,
        },
        ],
    },
    primitive: {
        topology: "triangle-list",
        // topology: "line-list",

        // Since we are seeing from inside of the cube
        // and we are using the regular cube geomtry data with outward-facing normals,
        // the cullMode should be 'front' or 'none'.
        //因为我们是从立方体内部看到的
        //并且我们使用具有向外法线的规则立方体几何数据，
        //cullMode应为“front”或“none”。
        cullMode: "none",
        // cullMode: "front",
        // cullMode: "back",
    },

    // Enable depth testing so that the fragment closest to the camera
    // is rendered in front.
    //启用深度测试，以便碎片离相机最近
    //在前面渲染。
    depthStencil: {
        depthWriteEnabled: true,
        depthCompare: "less",
        format: "depth32float",
    },
    });

    // Fetch the 6 separate images for negative/positive x, y, z axis of a cubemap
    // and upload it into a GPUTexture.
    // 天空盒纹理
    let skyBoxmapTexture: GPUTexture;
    {
        // The order of the array layers is [+X, -X, +Y, -Y, +Z, -Z]
        const imgSrcs = [
            new URL(
              `../../public/img/cubemap_2/px.png`,
              import.meta.url
            ).toString(),
            new URL(
              `../../public/img/cubemap_2/nx.png`,
              import.meta.url
            ).toString(),
            new URL(
              `../../public/img/cubemap_2/py.png`,
              import.meta.url
            ).toString(),
            new URL(
              `../../public/img/cubemap_2/ny.png`,
              import.meta.url
            ).toString(),
            new URL(
              `../../public/img/cubemap_2/pz.png`,
              import.meta.url
            ).toString(),
            new URL(
              `../../public/img/cubemap_2/nz.png`,
              import.meta.url
            ).toString(),
            // new URL(
            //   `../../public/img/cubemap_1/px.jpg`,
            //   import.meta.url
            // ).toString(),
            // new URL(
            //   `../../public/img/cubemap_1/nx.jpg`,
            //   import.meta.url
            // ).toString(),
            // new URL(
            //   `../../public/img/cubemap_1/py.jpg`,
            //   import.meta.url
            // ).toString(),
            // new URL(
            //   `../../public/img/cubemap_1/ny.jpg`,
            //   import.meta.url
            // ).toString(),
            // new URL(
            //   `../../public/img/cubemap_1/pz.jpg`,
            //   import.meta.url
            // ).toString(),
            // new URL(
            //   `../../public/img/cubemap_1/nz.jpg`,
            //   import.meta.url
            // ).toString(),
            // Cubeimg2
            // new URL(
            // `../../public/img/cubemap/posx.jpg`,
            // import.meta.url
            // ).toString(),
            // new URL(
            // `../../public/img/cubemap/negx.jpg`,
            // import.meta.url
            // ).toString(),
            // new URL(
            // `../../public/img/cubemap/posy.jpg`,
            // import.meta.url
            // ).toString(),
            // new URL(
            // `../../public/img/cubemap/negy.jpg`,
            // import.meta.url
            // ).toString(),
            // new URL(
            // `../../public/img/cubemap/posz.jpg`,
            // import.meta.url
            // ).toString(),
            // new URL(
            // `../../public/img/cubemap/negz.jpg`,
            // import.meta.url
            // ).toString(),
        ];
        const promises = imgSrcs.map(async (src) => {
            const response = await fetch(src);
            return createImageBitmap(await response.blob());
        });
        const imageBitmaps = await Promise.all(promises);

        skyBoxmapTexture = device.createTexture({
            dimension: "2d",
            // Create a 2d array texture.
            // Assume each image has the same size.
            size: [imageBitmaps[0].width, imageBitmaps[0].height, 6],
            format: "rgba8unorm",
            usage:
            GPUTextureUsage.TEXTURE_BINDING |
            GPUTextureUsage.COPY_DST |
            GPUTextureUsage.RENDER_ATTACHMENT,
        });

        for (let i = 0; i < imageBitmaps.length; i++) {
            const imageBitmap = imageBitmaps[i];
            device.queue.copyExternalImageToTexture(
            { source: imageBitmap },
            { texture: skyBoxmapTexture, origin: [0, 0, i] },
            [imageBitmap.width, imageBitmap.height]
            );
        }
    }
    // 采样器
    const sampler = device.createSampler({
    magFilter: "linear",
    minFilter: "linear",
    });
    // 模型变换矩阵
    const uniformBufferSize = 4 * 16; // 4x4 matrix
    const skyBoxModelMatrixBuffer = device.createBuffer({
        size: uniformBufferSize,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    const modelMatrix = mat4.scaling(vec3.fromValues(1000, 1000, 1000));
    const modelMatrixArray = new Float32Array(modelMatrix);    
    device.queue.writeBuffer(
        skyBoxModelMatrixBuffer,
        0,
        modelMatrixArray.buffer,
        modelMatrixArray.byteOffset,
        modelMatrixArray.byteLength
    );



    const SKYBOXOBJ = {
        skyBoxVerticesBuffer,skyBoxPipeline,skyBoxmapTexture,sampler,skyBoxModelMatrixBuffer,
        cubeVertexCount
    }
    return SKYBOXOBJ
}