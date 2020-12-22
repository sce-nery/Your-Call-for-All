import Stats from "../../vendor/stats.module.js";

export function createPerformanceMonitor() {
    let stats = new Stats();
    stats.showPanel(0);

    document.body.appendChild(stats.domElement);

    return stats;
}
