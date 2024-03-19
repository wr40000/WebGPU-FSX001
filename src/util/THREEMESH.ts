import * as THREE from 'three'

export default async function initThreeMesh(
    device:GPUDevice,
    format:GPUTextureFormat,
    initThreeGeometryPipelineLayout: GPUPipelineLayout,
    whitchGeometry: string,
    ThreeGeometryVertWGSL:string,
    ThreeGeometryFragWGSL:string,
    GUIThreeGeometry:{topologyIsline_list:boolean} | {topologyIsline_list:true}
){
    // console.log(whitchGeometry);
    
    const ThreeGeometryPipeline = await device.createRenderPipelineAsync({
        label: 'ThreeGeometryPipeline',
        layout: initThreeGeometryPipelineLayout,
        vertex:{
            module:device.createShaderModule({
                code:ThreeGeometryVertWGSL
            }),
            entryPoint: 'main',
            buffers:[{
                arrayStride: 8 * 4,
                attributes:[
                    {
                        // position
                        shaderLocation:0,
                        offset:0,
                        format: 'float32x3'
                    },
                    {
                        // normal
                        shaderLocation:1,
                        offset: 3 * 4,
                        format: 'float32x3'
                    },
                    {
                        // uv
                        shaderLocation:2,
                        offset: 6 * 4,
                        format: 'float32x2'
                    }
                ]
            }]
        },
        fragment:{
            module: device.createShaderModule({
                code:ThreeGeometryFragWGSL
            }),
            entryPoint: 'main',
            targets: [
                {
                    format,
                    blend: {
                        color: {
                            srcFactor: "one",
                            dstFactor: "one-minus-src-alpha",
                            operation: "add"
                        },
                        alpha: {
                            srcFactor: "zero",
                            dstFactor: "zero",
                            operation: "add"
                        }
                    }
                }
            ]
        },
        primitive:{
            topology: GUIThreeGeometry.topologyIsline_list ? 'triangle-list':'line-list',
            // topology: 'line-list',
            // topology: 'point-list',
            // topology: 'line-strip',
            // topology: 'triangle-strip',
            // Culling backfaces pointing away from the camera
            cullMode: 'none',
            // cullMode: 'back',
            // cullMode: 'front',
            frontFace: 'ccw'
        },
        depthStencil:{
            depthWriteEnabled: true,
            depthCompare: 'less',
            format: 'depth32float'
        },
        // multisample: {
        //     count: 4,
        // }
    } as GPURenderPipelineDescriptor)

    // three Geometry
    // BoxGeometry CapsuleGeometry CircleGeometry ConeGeometry CylinderGeometry DodecahedronGeometry
    // PlaneGeometry RingGeometry ShapeGeometry SphereGeometry TorusGeometry TorusKnotGeometry TubeGeometry
    let cubeOFThree: THREE.BufferGeometry | undefined;
    if(whitchGeometry == 'BoxGeometry'){
        cubeOFThree = new THREE.BoxGeometry(1, 1, 1, 10, 10, 10)
    }else if(whitchGeometry == 'CapsuleGeometry'){
        cubeOFThree = new THREE.CapsuleGeometry( 1, 1, 32, 64 )
    }else if(whitchGeometry == 'CircleGeometry'){
        cubeOFThree = new THREE.CircleGeometry( 1, 32 );
    }else if(whitchGeometry == 'ConeGeometry'){
        cubeOFThree = new THREE.ConeGeometry( 1, 1, 32 );
    }else if(whitchGeometry == 'CylinderGeometry'){
        cubeOFThree = new THREE.CylinderGeometry( 1, 1, 1, 32 );
    }else if(whitchGeometry == 'PlaneGeometry'){
        cubeOFThree = new THREE.PlaneGeometry( 2, 2, 192, 192 )
    }else if(whitchGeometry == 'RingGeometry'){
        cubeOFThree = new THREE.RingGeometry( 0.5, 1, 32 );
    }else if(whitchGeometry == 'ShapeGeometry'){
        const x = 0, y = 0;

        const heartShape = new THREE.Shape();
        
        heartShape.moveTo( x + 0.5, y + 0.5 );
        heartShape.bezierCurveTo( x + 0.5, y + 0.5, x + 0.4, y, x, y );
        heartShape.bezierCurveTo( x - 0.6, y, x - 0.6, y + 0.7,x - 0.6, y + 0.7 );
        heartShape.bezierCurveTo( x - 0.6, y + 1.1, x - 0.3, y + 1.54, x + 0.5, y + 1.9 );
        heartShape.bezierCurveTo( x + 1.2, y + 1.54, x + 1.6, y + 1.1, x + 1.6, y + 0.7 );
        heartShape.bezierCurveTo( x + 1.6, y + 0.7, x + 1.6, y, x + 1.0, y );
        heartShape.bezierCurveTo( x + 0.7, y, x + 0.5, y + 0.5, x + 0.5, y + 0.5 );
        
        cubeOFThree = new THREE.ShapeGeometry( heartShape );
    }else if(whitchGeometry == 'SphereGeometry'){
        cubeOFThree = new THREE.SphereGeometry( 1, 32, 16 )
    }else if(whitchGeometry == 'TorusGeometry'){
        cubeOFThree = new THREE.TorusGeometry( 1, 0.3, 16, 100 );
    }else if(whitchGeometry == 'TorusKnotGeometry'){
        // 报错 无法使用
        cubeOFThree = new THREE.TorusKnotGeometry( 1, 0.3, 100, 16 );
    }
    // else if(whitchGeometry == 'TubeGeometry'){
    //     class CustomSinCurve extends THREE.Curve {

    //         constructor( scale = 1 ) {
        
    //             super();
        
    //             this.scale = scale;
        
    //         }
        
    //         getPoint( t, optionalTarget = new THREE.Vector3() ) {
        
    //             const tx = t * 3 - 1.5;
    //             const ty = Math.sin( 2 * Math.PI * t );
    //             const tz = 0;
        
    //             return optionalTarget.set( tx, ty, tz ).multiplyScalar( this.scale );
        
    //         }
        
    //     }
        
    //     const path = new CustomSinCurve( 10 );
    //     cubeOFThree = new THREE.TubeGeometry( path, 20, 2, 8, false );
    // }

    if(cubeOFThree == undefined)
        throw new Error
    let arrayFromThreeNormal = cubeOFThree.attributes.normal.array
    let arrayFromThreeUV = cubeOFThree.attributes.uv.array
    let arrayFromThreePosition = cubeOFThree.attributes.position.array
    let arrayFromThreeCount = cubeOFThree.attributes.position.count
    let input = new Float32Array(arrayFromThreeCount * 8)
    
    for(let i = 0; i < arrayFromThreeCount; i++){
        input[i*8 + 0] = arrayFromThreePosition[i*3 + 0]
        input[i*8 + 1] = arrayFromThreePosition[i*3 + 1]
        input[i*8 + 2] = arrayFromThreePosition[i*3 + 2]
        input[i*8 + 3] = arrayFromThreeNormal[i*3 + 0]
        input[i*8 + 4] = arrayFromThreeNormal[i*3 + 1]
        input[i*8 + 5] = arrayFromThreeNormal[i*3 + 2]
        input[i*8 + 6] = arrayFromThreeUV[i*2 + 0]
        input[i*8 + 7] = arrayFromThreeUV[i*2 + 1]
    }
    if(cubeOFThree.index == null)
        throw new Error()
    let arrayFromThreeIndex = cubeOFThree.index.array
    let arrayFromThreeIndexCount = cubeOFThree.index.count
    const vertexBufferFromThree = device.createBuffer({
        label: 'GPUBuffer store vertex',
        size: input.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE,
    })
    const vertexindexFromThree = device.createBuffer({
        label: 'GPUBuffer store vertex index',
        size: arrayFromThreeIndex.byteLength,
        usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE
    })
    device.queue.writeBuffer(vertexindexFromThree, 0, arrayFromThreeIndex)
    device.queue.writeBuffer(vertexBufferFromThree, 0, input)

    return {ThreeGeometryPipeline, vertexindexFromThree, vertexBufferFromThree, arrayFromThreeIndexCount}
}