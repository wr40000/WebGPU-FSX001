import particlesPointVertex from '../shaders/particlesPointVertex.wgsl?raw'
import particlesPointFragment from '../shaders/particlesPointFragment.wgsl?raw'
import particlesPointCompute from '../shaders/particlesPointCompute.wgsl?raw'
import { mat4, vec2, vec3, vec4 } from 'webgpu-matrix'
import {particlePointNUM} from './const'

export async function initParticlesPoint(
    device: GPUDevice,
    format: GPUTextureFormat,
    NUM: number
    ){

    const particlesPointBindingGroupLayout = device.createBindGroupLayout({
        entries:[            
            {
                binding:0,
                visibility: GPUShaderStage.VERTEX,
                buffer:{
                    type: 'read-only-storage'
                }
            },
            {
                binding:1,
                visibility: GPUShaderStage.VERTEX,
                buffer:{
                    type: 'uniform'
                }
            },
            // {
            //     binding:0,
            //     visibility: GPUShaderStage.VERTEX,
            //     buffer:{
            //         type: 'storage'
            //     }
            // },
        ]
    })
    const particlesPointPipeLineLayout = device.createPipelineLayout({
        bindGroupLayouts: [particlesPointBindingGroupLayout]
    })
    const particlesPointPipeLine = await device.createRenderPipelineAsync({
        label: 'particlesPointPipeLineLayout-Vertex&Fragment',
        layout:particlesPointPipeLineLayout,
        // layout:'auto',
        vertex:{
            module: device.createShaderModule({
                code: particlesPointVertex
            }),
            entryPoint: 'main',
            buffers: [{
                arrayStride: 6 * 4,
                attributes: [
                    {
                        shaderLocation: 0,
                        offset: 0,
                        format: 'float32x3',
                    },
                    {
                        shaderLocation: 1,
                        offset: 3 * 4,
                        format: 'float32x3',
                    },
                ]
            }]
        },
        fragment: {
            module: device.createShaderModule({
                code:particlesPointFragment
            }),
            entryPoint: 'main',
            targets: [
                {
                    format
                }
            ]
        },
        primitive: {
            // topology: 'triangle-list',
            // topology: 'line-list',
            topology: 'point-list',
            cullMode: 'back'
        },
        depthStencil: {
            depthCompare: 'less',
            depthWriteEnabled: true,
            format: 'depth32float'
            
        }
    } as GPURenderPipelineDescriptor)
    
    // const computeParticlesPointBindingGroupLayout = device.createBindGroupLayout({
    //     entries:[
    //         {
    //             binding:0,
    //             visibility: GPUShaderStage.COMPUTE,
    //             buffer:{
    //                 type: 'storage'
    //             }
    //         },
    //         {
    //             binding:1,
    //             visibility: GPUShaderStage.COMPUTE,
    //             buffer:{
    //                 type: 'storage'
    //             }
    //         },
    //         {
    //             binding:2,
    //             visibility: GPUShaderStage.COMPUTE,
    //             buffer:{
    //                 type: 'storage'
    //             }
    //         },
    //         {
    //             binding:3,
    //             visibility: GPUShaderStage.COMPUTE,
    //             buffer:{
    //                 type: 'uniform'
    //             }
    //         },
    //         {
    //             binding:4,
    //             visibility: GPUShaderStage.COMPUTE,
    //             buffer:{
    //                 type: 'storage'
    //             }
    //         },
    //     ]
    // })
    // const computeParticlesPointPipeLineLayout = device.createPipelineLayout({
    //     bindGroupLayouts: [computeParticlesPointBindingGroupLayout]
    // })
    // const particlesPointComputePipeLine = await device.createComputePipelineAsync({
    //     label: 'particlesPointComputePipeLine',
    //     layout: computeParticlesPointPipeLineLayout,
    //     compute: {
    //         module: device.createShaderModule({
    //             code: particlesPointCompute
    //         }),
    //         entryPoint: 'main'
    //     }
    // })
    const input = new Float32Array([particlePointNUM, -5, 5, -5, 5, -5, 5]);
    const velocity = vec4.create(0.05, 0.05, 0.05, 0.05) as Float32Array;
    
    // 粒子运动范围
    const inputBuffer = device.createBuffer({
        size: input.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        mappedAtCreation: true
    })
    new Float32Array(inputBuffer.getMappedRange()).set(input);
    inputBuffer.unmap();
    // 粒子速度
    const velocityBuffer = device.createBuffer({
        size: velocity.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        mappedAtCreation: true
    })
    new Float32Array(velocityBuffer.getMappedRange()).set(velocity);
    velocityBuffer.unmap();

    const particlePosition = new Float32Array(
        [1,1,1,1,0,0]
    )
    const particlesVertexBuffer = device.createBuffer({
        size: 6 * 4,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.VERTEX,
        mappedAtCreation: true
    })
    new Float32Array(particlesVertexBuffer.getMappedRange()).set(particlePosition);
    particlesVertexBuffer.unmap();

    const particlesModelArray = new Float32Array(NUM * 4 * 4);
    // 模型变换矩阵
    const particlesModelBuffer = device.createBuffer({
        size: 500000 * 4 * 4 * 4,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE        
    })
    console.time("writerBuffer Particles Point")
    for( let i = 0; i < NUM; i++){
         // 生成随机的角度（0 到 2π）
        const angle = Math.random() * Math.PI * 2;
        // 生成随机的半径（0 到 5）
        const radius = Math.random() * 2;

        const particlesPositionMatrix = mat4.identity();
        const xOffset = radius * Math.cos(angle) - 1;
        const yOffset = (Math.random() - 0.5) * 2 * - 1;
        const zOffset = radius * Math.sin(angle)-3;
        mat4.translate(particlesPositionMatrix,[xOffset, yOffset, zOffset], particlesPositionMatrix)
        particlesModelArray.set(particlesPositionMatrix as Float32Array, i * 4 * 4)
    }
    console.timeEnd("writerBuffer Particles Point")
    // 粒子mvp矩阵
    const particlesPointMVPMatrixBuffer = device.createBuffer({
        size: 500000 * 4 * 4,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE
    })
    device.queue.writeBuffer(
        particlesModelBuffer,
        0,
        particlesModelArray
    )

    const particlesPointObj = {
        particlesPointBindingGroupLayout,
        particlesPointPipeLine,
        particlesVertexBuffer,
        particlesModelBuffer,
        inputBuffer,
        velocityBuffer,
        // computeParticlesPointBindingGroupLayout,
        // particlesPointComputePipeLine,
        // particlesPointMVPMatrixBuffer
    }
    return particlesPointObj
}