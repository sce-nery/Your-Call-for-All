import Stats from "../../vendor/stats.module.js";

export function createPerformanceMonitor(container = null, offsetX = 0) {
    let stats = new Stats();
    stats.showPanel(0);

    if (container === null) {
        document.body.appendChild(stats.domElement);
    } else {
        container.appendChild(stats.domElement);
    }

    stats.domElement.style.cssText = `position:absolute;top:0px;left:${offsetX}px;`;
    return stats;
}
