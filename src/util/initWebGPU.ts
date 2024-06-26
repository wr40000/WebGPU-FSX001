// initialize webgpu device & config canvas context
export default async function initWebGPU(canvas: HTMLCanvasElement) {
    console.log(navigator);
    
    if(!navigator.gpu)
        throw new Error('Not Support WebGPU')
    const adapter = await navigator.gpu.requestAdapter()
    if (!adapter)
        throw new Error('No Adapter Found')
    const device = await adapter.requestDevice()
    // 设备支持资源组最大绑定资源数目
    const maxBindGroups = device.limits.maxBindGroups;
    const maxBindingsPerBindGroups = device.limits.maxBindingsPerBindGroup;
    // console.log(`Max Bind Groups: ${maxBindGroups}`);
    // console.log(`max Bindings Per BindGroups: ${maxBindingsPerBindGroups}`);
    const context = canvas.getContext('webgpu') as GPUCanvasContext
    const format = navigator.gpu.getPreferredCanvasFormat()
    const devicePixelRatio = window.devicePixelRatio || 1
    canvas.width = canvas.clientWidth * devicePixelRatio
    canvas.height = canvas.clientHeight * devicePixelRatio
    const size = {width: canvas.width, height: canvas.height}
    context.configure({
        device, format,
        // prevent chrome warning after v102
        alphaMode: 'opaque',
        // 设置权限，可作为复制的源
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
    })
    const depthTexture = device.createTexture({
      size: [canvas.width, canvas.height],
      format: "depth32float",
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
    const depthView = depthTexture.createView()
    return {device, context, format, size, depthTexture, depthView}
  }