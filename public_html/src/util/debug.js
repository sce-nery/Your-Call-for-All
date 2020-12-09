import Stats from "../../vendor/stats.module.js";

export function createPerformanceMonitors() {
    let monitors = {};

    monitors.fps = new Stats();
    monitors.memory = new Stats();

    monitors.begin = function () {
        monitors.fps.begin();
        monitors.memory.begin();
    }

    monitors.end = function () {
        monitors.fps.end();
        monitors.memory.end();
    }

    monitors.fps.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    monitors.memory.showPanel(2);

    monitors.fps.domElement.style.cssText = 'position:absolute;top:0px;left:0px;'
    monitors.memory.domElement.style.cssText = 'position:absolute;top:0px;left:80px;';

    document.body.appendChild(monitors.fps.domElement);
    document.body.appendChild(monitors.memory.domElement);

    return monitors;
}
