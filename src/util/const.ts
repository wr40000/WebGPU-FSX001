export const GUIForthreeGeometry = {
    topologyIsline_list:true
}
export const GUIForFlatthreeGeometry = {
    topologyIsline_list:true
}

export const particlePointNUM = 20000;

// uniformBuffer
// #region
const uniformBufferSize = 4 * 16; // 4x4 matrix
export async function initUNIFORM(device: GPUDevice){
    const timeFrameDeferenceBuffer = device.createBuffer({
        size: 4,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM
        })
    const flatElevationBuffer = device.createBuffer({
        size: 4,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM
    })
    const flatBigWavesFrequencyBuffer = device.createBuffer({
        size: 4 * 2,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM
    })
    // 相机cameraVPMatrix矩阵
    const cameraVPMatrixBuffer = device.createBuffer({
        size: uniformBufferSize,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM
    })
    const particlesPointMVPMatrixBuffer = device.createBuffer({
        size: uniformBufferSize,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM
    })

    let cubeTextureImg: GPUTexture;
    {
        const response = await fetch(
            new URL("../../public/img/Di-3d.png", import.meta.url).toString()
        );
        const imageBitmap = await createImageBitmap(await response.blob());

        cubeTextureImg = device.createTexture({
            size: [imageBitmap.width, imageBitmap.height, 1],
            format: "rgba8unorm",
            usage:
            GPUTextureUsage.TEXTURE_BINDING |
            GPUTextureUsage.COPY_DST |
            GPUTextureUsage.RENDER_ATTACHMENT,
        });
        device.queue.copyExternalImageToTexture(
            { source: imageBitmap },
            { texture: cubeTextureImg },
            [imageBitmap.width, imageBitmap.height]
        );
    }
    let particlesTextureImg: GPUTexture;
    {
        const response = await fetch(
            new URL("../../public/particlesImg/6.png", import.meta.url).toString()
        );
        const imageBitmap = await createImageBitmap(await response.blob());

        particlesTextureImg = device.createTexture({
            size: [imageBitmap.width, imageBitmap.height, 1],
            format: "rgba8unorm",
            usage:
            GPUTextureUsage.TEXTURE_BINDING |
            GPUTextureUsage.COPY_DST |
            GPUTextureUsage.RENDER_ATTACHMENT,
        });
        device.queue.copyExternalImageToTexture(
            { source: imageBitmap },
            { texture: particlesTextureImg },
            [imageBitmap.width, imageBitmap.height]
        );
    }


    return {timeFrameDeferenceBuffer,
        flatElevationBuffer,
        flatBigWavesFrequencyBuffer,
        cameraVPMatrixBuffer,
        cubeTextureImg,
        particlesTextureImg,
        particlesPointMVPMatrixBuffer                
    }
}
// #endregion