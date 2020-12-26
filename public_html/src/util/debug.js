import Stats from "../../vendor/stats.module.js";

export function createPerformanceMonitor(container = null) {
    let stats = new Stats();
    stats.showPanel(0);

    if (container === null) {
        document.body.appendChild(stats.domElement);
    } else {
        container.appendChild(stats.domElement);
    }

    return stats;
}
