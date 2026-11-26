export const isVisible = (
    zoomSpec: number,
    mapFeature: "macro" | "micro",
    zoomLevel: number,
) => {
    if (mapFeature === "macro") {
        return zoomLevel <= zoomSpec;
    } else if (mapFeature === "micro") {
        return zoomLevel >= zoomSpec;
    } else {
        return false;
    }
};
