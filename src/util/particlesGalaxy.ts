import particlesGalaxyVertex from '../shaders/particlesGalaxyVertex.wgsl?raw'
import particlesGalaxyFragment from '../shaders/particlesGalaxyFragment.wgsl?raw'
import {SphereLayout, createSphereMesh} from '../meshes/sphere'
import {sphereMesh} from '../util/GUI'
import { mat4 } from 'webgpu-matrix'

export async function initParticlesGalaxy(
    device: GPUDevice,
    canvas: HTMLCanvasElement,
    format: GPUTextureFormat,
    NUM: number
    ){
    const {vertexStride,positionsOffset,normalOffset,uvOffset,} = SphereLayout;
    const { radius, widthSegments, heightSegments, randomness } = sphereMesh;
    const {vertices,indices} = 
        await createSphereMesh(radius, widthSegments, heightSegments, randomness);

    const particlesGalaxyBindingGroupLayout = device.createBindGroupLayout({
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
            {
                binding:2,
                visibility: GPUShaderStage.VERTEX,
                buffer:{
                    type: 'uniform'
                }
            },
            {
                binding:3,
                visibility: GPUShaderStage.FRAGMENT,
                texture:{}
            },
            {
                binding:4,
                visibility: GPUShaderStage.FRAGMENT,
                sampler: {}
            },
        ]
    })
    const particlesGalaxyPipeLineLayout = device.createPipelineLayout({
        bindGroupLayouts: [particlesGalaxyBindingGroupLayout]
    })
    const particlesGalaxyPipeLine = await device.createRenderPipelineAsync({
        label: 'particlesGalaxyPipeLineLayout-Vertex&Fragment',
        layout:particlesGalaxyPipeLineLayout,
        vertex:{
            module: device.createShaderModule({
                code: particlesGalaxyVertex
            }),
            entryPoint: 'main',
            buffers: [{
                arrayStride: vertexStride,
                attributes: [
                    {
                        shaderLocation: 0,
                        offset: positionsOffset,
                        format: 'float32x3',
                    },
                    {
                        shaderLocation: 1,
                        offset: normalOffset,
                        format: 'float32x3',
                    },
                    {
                        shaderLocation: 2,
                        offset: uvOffset,
                        format: 'float32x2',
                    },
                ]
            }]
        },
        fragment: {
            module: device.createShaderModule({
                code:particlesGalaxyFragment
            }),
            entryPoint: 'main',
            targets: [
                {
                    format
                }
            ]
        },
        primitive: {
            topology: 'triangle-list',
            // topology: 'line-list',
            cullMode: 'back'
        },
        depthStencil: {
            depthCompare: 'less',
            depthWriteEnabled: true,
            format: 'depth32float'
            
        }
    } as GPURenderPipelineDescriptor)

    const particlesModelArray = new Float32Array(NUM * 4 * 4);
    const particlesModelBuffer = device.createBuffer({
        size: NUM * 4 * 4 * 4,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC | GPUBufferUsage.STORAGE        
    })
    const particlesVertexBuffer = device.createBuffer({
        size: vertices.byteLength,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX       
    })
    const particlesVertexIndexBuffer = device.createBuffer({
        size: indices.byteLength,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE | GPUBufferUsage.INDEX        
    })
    console.time("writerBuffer Particles Galaxy")
    for( let i = 0; i < NUM; i++){
         // 生成随机的角度（0 到 2π）
        const angle = Math.random() * Math.PI * 2;
        // 生成随机的半径（0 到 5）
        const radius = Math.random() * 5;

        const particlesPositionMatrix = mat4.identity();
        const xOffset = radius * Math.cos(angle);
        const yOffset = (Math.random() - 0.5) * 2 * 0.1;
        const zOffset = radius * Math.sin(angle);
        // const xRotate = (Math.random() - 0.5) * 2 * Math.PI / 6;
        // const yRotate = (Math.random() - 0.5) * 2 * Math.PI / 6;
        // const zRotate = (Math.random() - 0.5) * 2 * Math.PI / 6;
        const scale = Math.random() * 2;
        mat4.translate(particlesPositionMatrix,[xOffset, yOffset, zOffset], particlesPositionMatrix)
        mat4.scale(particlesPositionMatrix, [scale, scale, scale], particlesPositionMatrix);
        particlesModelArray.set(particlesPositionMatrix as Float32Array, i * 4 * 4)
    }
    console.timeEnd("writerBuffer Particles Galaxy")
    device.queue.writeBuffer(
        particlesModelBuffer,
        0,
        particlesModelArray
    )
    device.queue.writeBuffer(
        particlesVertexBuffer,
        0,
        vertices
    )
    device.queue.writeBuffer(
        particlesVertexIndexBuffer,
        0,
        indices
    )
    const sphereCount = indices.length
    const particleObj = {
        particlesGalaxyBindingGroupLayout,
        particlesGalaxyPipeLine,
        particlesModelBuffer,
        particlesVertexBuffer,
        particlesVertexIndexBuffer,
        sphereCount
    }
    return particleObj
    // console.log(particlesModelArray);    
}