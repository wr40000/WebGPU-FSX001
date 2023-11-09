import { vec4 } from "webgpu-matrix"
import * as dat from 'dat.gui'
import Stats from 'three/examples/jsm/libs/stats.module.js'
// GUI

const gui = new dat.GUI();
gui.close()
gui.width = 400
const threeGeometryAttributes = {
    rotateSpeed:700,    //threeGeometry转速
    colorFrequency:0.001,   // 颜色变化频率
    gl_FragColor:vec4.create(0.5, 0.8, 1.0, 1.0),   //flat底色
    Elevation:0.2,
    uBigWavesFrequency: { value: [4, 1.5], xFrequency: 4, yFrequency: 1.5 },  //vec2.create(4, 1.5)
    scaleOfFlat:{ xScale: 13, yScale: 13},    //flat 缩放
    isShow:true,
    is_8k:true,
    shape: 'SphereGeometry'
}
const sphereMesh = {
    radius: 0.01,
    widthSegments: 32,
    heightSegments: 16,
    randomness: 0
}
const skyBoxAttr = {
    skyMap: '水天一色'
}

const threeGeometry = gui.addFolder("threeGeometry")
threeGeometry.add(threeGeometryAttributes, 'rotateSpeed').min(5).max(100).step(0.01).name('旋转速度');
threeGeometry.add(threeGeometryAttributes, 'colorFrequency').min(0).max(0.01).step(0.0001).name('颜色波动频率');
threeGeometry.add(threeGeometryAttributes, 'isShow');


const flat = gui.addFolder("flat")
flat.add(threeGeometryAttributes, 'Elevation').min(0).max(3).step(0.01);
flat.add(threeGeometryAttributes.uBigWavesFrequency, 'xFrequency').min(0).max(10).step(0.001).name('平面波动频率-X')
flat.add(threeGeometryAttributes.uBigWavesFrequency, 'yFrequency').min(0).max(10).step(0.001).name('平面波动频率-Y')
flat.add(threeGeometryAttributes.scaleOfFlat, 'xScale').min(10).max(300).step(0.001).name('平面放大-X')
flat.add(threeGeometryAttributes.scaleOfFlat, 'yScale').min(10).max(300).step(0.001).name('平面放大-Y')

const SkyBoxGui = gui.addFolder("SkyBox")
// 创建性能监视器
// #region
// let stats = new Stats()as { domElement: HTMLDivElement,setMode(mode: number): void }
let stats: any = new Stats()

// // 设置监视器面板，传入面板id（0: fps, 1: ms, 2: mb）
stats.setMode(0)

// // 设置监视器位置
stats.domElement.style.position = 'absolute'
stats.domElement.style.left = '0px'
stats.domElement.style.top = '0px'
// 将监视器添加到页面中
document.body.appendChild(stats.domElement)
// #endregion

// 点粒子
const particlesPointAttr = {
    range: new Float32Array([10000, -5,5,-5,5,-5,5]),
    angle: Math.random() * Math.PI * 2,
    // 生成随机的半径（0 到 5）
    radius: Math.random() * 2,
    velocity: 0.001
}
const particlesPoint = gui.addFolder("particlesPoint")


export {stats, threeGeometryAttributes, skyBoxAttr, threeGeometry, flat, SkyBoxGui, sphereMesh,
     particlesPoint, particlesPointAttr}