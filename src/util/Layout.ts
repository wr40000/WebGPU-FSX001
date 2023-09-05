export default function initLayout(device: GPUDevice){
    const SkyBoxBindGroupLayout = device.createBindGroupLayout({
    label: "SkyBoxBindGroupLayout",
    entries: [
        {
            binding: 0,
            visibility: GPUShaderStage.VERTEX,
            buffer: {
                type: "uniform",
            },
        },
        {
            binding: 1,
            visibility: GPUShaderStage.VERTEX,
            buffer: {
                type: "uniform",
            },
        },
        {
        binding: 2,
        visibility: GPUShaderStage.FRAGMENT,
        sampler: {
            type: "filtering", // You can specify "filtering", "non-filtering", or "comparison"
        },
        },
        {
        binding: 3,
        visibility: GPUShaderStage.FRAGMENT,
        texture: {
            // "float" for regular textures, "depth" for depth textures
            sampleType: "float",
            // Specify the appropriate view dimension (e.g., "1d", "2d", "3d", "cube")
            viewDimension: "cube", 
            // Set to true if the texture is multisampled
            multisampled: false, 
        },
        },
    ],
    });
    const SkyBoxPipelineLayout = device.createPipelineLayout({
    bindGroupLayouts: [SkyBoxBindGroupLayout],
    });

    // flat BindingGroupLayout PipelineLayout initThreeMesh
    const initflatThreeGeometryBindingGroupLayout1 = device.createBindGroupLayout({
        entries: [
            {
                binding: 0,
                visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
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
            {
                binding: 3,
                visibility: GPUShaderStage.VERTEX,
                buffer: {
                    type: 'uniform',
                }
            },
            {
                binding: 4,
                visibility: GPUShaderStage.VERTEX,
                buffer: {
                    type: 'uniform',
                }
            },
            {
                binding: 5,
                visibility: GPUShaderStage.FRAGMENT,
                sampler:{}
            },
        ]
        })
    const initflatThreeGeometryBindingGroupLayout2 = device.createBindGroupLayout({
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
            visibility: GPUShaderStage.FRAGMENT,
            texture:{}
        },
        {
            binding: 3,
            visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.VERTEX,
            texture:{
                sampleType: 'depth'
            }
        },
        {
            binding: 4,
            visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.VERTEX,
            sampler: {
                type: 'comparison'
            }
        },
    ]
    })
    const initflatThreeGeometryPipelineLayout = device.createPipelineLayout({
    bindGroupLayouts: [initflatThreeGeometryBindingGroupLayout1,initflatThreeGeometryBindingGroupLayout2]
    })   

    // three Geometry BindingGroupLayout PipelineLayout initThreeMesh
    const initThreeGeometryBindingGroupLayout = device.createBindGroupLayout({
        entries: [
            {
                binding: 0,
                visibility: GPUShaderStage.FRAGMENT,
                texture:{}
            },
            {
                binding: 1,
                visibility: GPUShaderStage.FRAGMENT,
                sampler:{}
            },
            {
                binding: 2,
                visibility: GPUShaderStage.VERTEX,
                buffer: {
                    type: 'uniform',
                }
            },
            {
                binding: 3,
                visibility: GPUShaderStage.VERTEX,
                buffer: {
                    type: 'uniform',
                }
            },
            {
                binding: 4,
                visibility: GPUShaderStage.VERTEX,
                buffer: {
                    type: 'uniform',
                }
            },
            {
                binding: 5,
                visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                buffer: {
                    type: 'uniform',
                }
            },
            {
                binding: 6,
                visibility: GPUShaderStage.VERTEX,
                buffer: {
                    type: 'uniform',
                }
            },
        ]
        })
    const initThreeGeometryPipelineLayout = device.createPipelineLayout({
    bindGroupLayouts: [initThreeGeometryBindingGroupLayout,
                        initflatThreeGeometryBindingGroupLayout2]
    })

  return {
        SkyBoxBindGroupLayout,
        SkyBoxPipelineLayout,
        initThreeGeometryBindingGroupLayout,
        initThreeGeometryPipelineLayout,
        initflatThreeGeometryBindingGroupLayout1,
        initflatThreeGeometryBindingGroupLayout2,
        initflatThreeGeometryPipelineLayout
    }
}