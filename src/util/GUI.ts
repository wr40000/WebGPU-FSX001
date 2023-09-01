import { vec4 } from "webgpu-matrix"
import * as dat from 'dat.gui'
import Stats from 'three/examples/jsm/libs/stats.module.js'
// GUI
// #region
const gui = new dat.GUI();
gui.width = 120
const threeGeometryAttributes = {
    rotateSpeed:100,    //threeGeometry转速
    colorFrequency:0.001,   // 颜色变化频率
    gl_FragColor:vec4.create(0.5, 0.8, 1.0, 1.0),   //flat底色
    Elevation:0.2,
    uBigWavesFrequency: { value: [4, 1.5] },  //vec2.create(4, 1.5)
    scaleOfFlat:{value: [3,3,1]}    //flat 缩放
}

const threeGeometry = gui.addFolder("threeGeometry")
threeGeometry.add(threeGeometryAttributes, 'rotateSpeed').min(5).max(100).step(0.01);
threeGeometry.add(threeGeometryAttributes, 'colorFrequency').min(0).max(0.01).step(0.0001);

const flat = gui.addFolder("flat")
flat.add(threeGeometryAttributes, 'Elevation').min(0).max(3).step(0.01);
flat.add(threeGeometryAttributes.uBigWavesFrequency.value, '0').min(0).max(10).step(0.001).name('uBigWavesFrequencyX')
flat.add(threeGeometryAttributes.uBigWavesFrequency.value, '1').min(0).max(10).step(0.001).name('uBigWavesFrequencyY')
flat.add(threeGeometryAttributes.scaleOfFlat.value, '0').min(1).max(10).step(0.001).name('scaleOfFlatX')
flat.add(threeGeometryAttributes.scaleOfFlat.value, '1').min(1).max(10).step(0.001).name('scaleOfFlatY')
// 创建性能监视器
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

export {stats, threeGeometryAttributes, threeGeometry, flat}