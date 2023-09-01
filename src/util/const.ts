export const GUIForthreeGeometry = {
    topologyIsline_list:true
}
export const GUIForFlatthreeGeometry = {
    topologyIsline_list:true
}

// uniformBuffer
// #region
const uniformBufferSize = 4 * 16; // 4x4 matrix
export function initUNIFORM(device: GPUDevice){
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
    return {timeFrameDeferenceBuffer,
        flatElevationBuffer,
        flatBigWavesFrequencyBuffer,
        cameraVPMatrixBuffer
    }
}
// #endregion