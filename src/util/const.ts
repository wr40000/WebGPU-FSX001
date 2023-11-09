import { mat4, vec2, vec3, vec4 } from "wgpu-matrix"

export const GUIForthreeGeometry = {
    topologyIsline_list:true
}
export const GUIForFlatthreeGeometry = {
    topologyIsline_list:true
}

// #region uniformBuffer
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

    let cubeTextureImg: GPUTexture;
    {
        const response = await fetch(
            // new URL("../../public/img/Di-3d.png", import.meta.url).toString()
            // new URL("../../public/img/moon.jpg", import.meta.url).toString()
            new URL("../../public/img/img1_1k.jpg", import.meta.url).toString()
            // new URL("../../public/img/img1_8k.jpg", import.meta.url).toString()
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
    let cubeTextureImg_8k: GPUTexture;
    {
        const response = await fetch(
            // new URL("../../public/img/Di-3d.png", import.meta.url).toString()
            new URL("../../public/img/img1_8k.jpg", import.meta.url).toString()
            // new URL("../../public/img/img1_8k.jpg", import.meta.url).toString()
        );
        const imageBitmap = await createImageBitmap(await response.blob());

        cubeTextureImg_8k = device.createTexture({
            size: [imageBitmap.width, imageBitmap.height, 1],
            format: "rgba8unorm",
            usage:
            GPUTextureUsage.TEXTURE_BINDING |
            GPUTextureUsage.COPY_DST |
            GPUTextureUsage.RENDER_ATTACHMENT,
        });
        device.queue.copyExternalImageToTexture(
            { source: imageBitmap },
            { texture: cubeTextureImg_8k },
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
        cubeTextureImg_8k,
        particlesTextureImg,                        
    }
}
// #endregion

// #region Light
export async function initLight(device: GPUDevice,size:{height:number,width:number}){
    const lightPositionBuffer = device.createBuffer({
        label: 'GPUBuffer store 4x4 matrix',
        size: 4 * 4, // 4 x float32: position vec4
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    })
    const lightViewProjectionBuffer = device.createBuffer({
        label: 'GPUBuffer for light projection',
        size: 4 * 4 * 4, // 4 x 4 x float32
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    })
    // dir light, 4 position
    // const lightPosition = vec3.fromValues(0, 10, -10)
    // const up = vec3.fromValues(0, 0, 1)
    // const origin = vec3.fromValues(0, 0, -10)
    const lightPosition = vec3.fromValues(0, 100, -7)
    const up = vec3.fromValues(0, 0, 1)
    const origin = vec3.fromValues(0, 0, -7)
    const lightViewMatrix =  mat4.lookAt(lightPosition, origin, up )
    // mat4.invert(lightViewMatrix, lightViewMatrix)
    const lightProjectionMatrix = mat4.perspective(Math.PI / 6, size.width / size.height, 0.01, 1000 )
    const lightOrthoMatrix = mat4.ortho(-40, 40, -40, 40, -50, 200);
    // 正交投影
    const lightViewProjectionMatrix =mat4.multiply(lightProjectionMatrix, lightViewMatrix)
    // 透视投影
    const lightViewOrthoMatrix =mat4.multiply(lightOrthoMatrix, lightViewMatrix)

    device.queue.writeBuffer(lightPositionBuffer, 0, lightPosition as Float32Array)
    device.queue.writeBuffer(lightViewProjectionBuffer,
                            0,
                            // lightViewProjectionMatrix as Float32Array
                            lightViewOrthoMatrix as Float32Array
                        )
    const lightObj = {
        lightPositionBuffer,
        lightViewProjectionBuffer,
        lightViewProjectionMatrix,
        lightViewOrthoMatrix
    }

    return lightObj
}
// #endregion
