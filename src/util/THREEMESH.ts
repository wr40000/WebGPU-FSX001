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
                    format
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
        cubeOFThree = new THREE.CircleGeometry( 5, 32 );
    }else if(whitchGeometry == 'ConeGeometry'){
        cubeOFThree = new THREE.ConeGeometry( 5, 20, 32 );
    }else if(whitchGeometry == 'CylinderGeometry'){
        cubeOFThree = new THREE.CylinderGeometry( 5, 5, 20, 32 );
    }else if(whitchGeometry == 'PlaneGeometry'){
        cubeOFThree = new THREE.PlaneGeometry( 2, 2, 192, 192 )
    }else if(whitchGeometry == 'RingGeometry'){
        cubeOFThree = new THREE.RingGeometry( 1, 5, 32 );
    }else if(whitchGeometry == 'ShapeGeometry'){
        const x = 0, y = 0;

        const heartShape = new THREE.Shape();
        
        heartShape.moveTo( x + 5, y + 5 );
        heartShape.bezierCurveTo( x + 5, y + 5, x + 4, y, x, y );
        heartShape.bezierCurveTo( x - 6, y, x - 6, y + 7,x - 6, y + 7 );
        heartShape.bezierCurveTo( x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19 );
        heartShape.bezierCurveTo( x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7 );
        heartShape.bezierCurveTo( x + 16, y + 7, x + 16, y, x + 10, y );
        heartShape.bezierCurveTo( x + 7, y, x + 5, y + 5, x + 5, y + 5 );
        
        cubeOFThree = new THREE.ShapeGeometry( heartShape );
    }else if(whitchGeometry == 'SphereGeometry'){
        cubeOFThree = new THREE.SphereGeometry( 1, 32, 16 )
    }else if(whitchGeometry == 'TorusGeometry'){
        cubeOFThree = new THREE.TorusGeometry( 1, 0.3, 16, 100 );
    }else if(whitchGeometry == 'TorusKnotGeometry'){
        cubeOFThree = new THREE.TorusKnotGeometry( 1, 0.3, 100, 16 );
    }else if(whitchGeometry == 'TubeGeometry'){
        class CustomSinCurve extends THREE.Curve {

            constructor( scale = 1 ) {
        
                super();
        
                this.scale = scale;
        
            }
        
            getPoint( t, optionalTarget = new THREE.Vector3() ) {
        
                const tx = t * 3 - 1.5;
                const ty = Math.sin( 2 * Math.PI * t );
                const tz = 0;
        
                return optionalTarget.set( tx, ty, tz ).multiplyScalar( this.scale );
        
            }
        
        }
        
        const path = new CustomSinCurve( 10 );
        cubeOFThree = new THREE.TubeGeometry( path, 20, 2, 8, false );
    }

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