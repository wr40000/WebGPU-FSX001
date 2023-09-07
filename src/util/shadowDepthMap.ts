import shadowDepth from '../shaders/shadowDepth.wgsl?raw'

export default async function initShadowDepthMap(
    device:GPUDevice,
    format: GPUTextureFormat
    ){
    const shadowDepthMapBindingGroupLayout = device.createBindGroupLayout({
        label: 'shadowDepthMapBindingGroupLayout',
        entries: [
            {
                binding: 0,
                visibility: GPUShaderStage.VERTEX,
                buffer :{
                    type: 'read-only-storage'
                }
            },
            {
                binding: 1,
                visibility: GPUShaderStage.VERTEX,
                buffer :{
                    type: 'uniform'
                }
            },
            // {
            //     binding: 2,
            //     visibility: GPUShaderStage.VERTEX,
            //     buffer: {
            //         type: 'uniform',
            //     }
            // },
        ]
    })
    const shadowDepthMapBindingGroupLayout1 = device.createBindGroupLayout({
        label: 'shadowDepthMapBindingGroupLayout',
        entries: [
            {
                binding: 0,
                visibility: GPUShaderStage.VERTEX,
                buffer: {
                    type: 'uniform',
                }
            },
            {
                binding: 1,
                visibility: GPUShaderStage.VERTEX,
                buffer: {
                    type: 'uniform',
                }
            },
            {
                binding: 2,
                visibility: GPUShaderStage.VERTEX,
                buffer: {
                    type: 'uniform',
                }
            },
        ]
    })
    const shadowDepthMapPipeLineLayout = device.createPipelineLayout({
        bindGroupLayouts: [shadowDepthMapBindingGroupLayout,shadowDepthMapBindingGroupLayout1]
    })
    const shadowDepthMapPipeLine = await device.createRenderPipelineAsync({
        label: 'shadowDepthMapPipeLine',
        layout: shadowDepthMapPipeLineLayout,
        vertex: {
            module: device.createShaderModule({
                code: shadowDepth,
            }),
            entryPoint: 'main',
            buffers: [{
                arrayStride: 8 * 4, // 3 position 2 uv,
                attributes: [
                    {
                        // position
                        shaderLocation: 0,
                        offset: 0,
                        format: 'float32x3',
                    },
                    {
                        // normal
                        shaderLocation: 1,
                        offset: 3 * 4,
                        format: 'float32x3',
                    },
                    {
                        // uv
                        shaderLocation: 2,
                        offset: 6 * 4,
                        format: 'float32x2',
                    },
                ]
            }]
        },
        primitive:{
            topology: 'triangle-list',
            cullMode: 'back'
        },
        depthStencil:{
            depthWriteEnabled: true,
            depthCompare: 'less',
            format: 'depth32float',
        }
    })
    const shadowDepthMapForParticlesPointPipeLine = await device.createRenderPipelineAsync({
        label: 'shadowDepthMapPipeLine',
        layout: shadowDepthMapPipeLineLayout,
        vertex: {
            module: device.createShaderModule({
                code: shadowDepth,
            }),
            entryPoint: 'main',
            buffers: [{
                arrayStride: 3 * 4, // 3 position 2 uv,
                attributes: [
                    {
                        // position
                        shaderLocation: 0,
                        offset: 0,
                        format: 'float32x3',
                    },
                    // {
                    //     // normal
                    //     shaderLocation: 1,
                    //     offset: 3 * 4,
                    //     format: 'float32x3',
                    // },
                    // {
                    //     // uv
                    //     shaderLocation: 2,
                    //     offset: 6 * 4,
                    //     format: 'float32x2',
                    // },
                ]
            }]
        },
        primitive:{
            topology: 'point-list',
            cullMode: 'back'
        },
        depthStencil:{
            depthWriteEnabled: true,
            depthCompare: 'less',
            format: 'depth32float',
        }
    })

    // 深度图
    const shadowDepthMapTexture = device.createTexture({
        // size: [2048,2048],
        size: [8192,8192],
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
        format: 'depth32float'
    })
    const shadowDepthView = shadowDepthMapTexture.createView()

    const shadowDepthSampler = device.createSampler({
        compare: 'less',
    })

    const shadowDepthMapObj = {
        shadowDepthMapBindingGroupLayout,
        shadowDepthMapBindingGroupLayout1,
        shadowDepthMapPipeLine,
        shadowDepthMapForParticlesPointPipeLine,
        shadowDepthMapTexture,
        shadowDepthView,
        shadowDepthSampler
    }
    return shadowDepthMapObj
}