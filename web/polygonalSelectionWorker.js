function segmentOrientation(p, q, r) {
    const val = (q[1] - p[1]) * (r[0] - q[0]) -
        (q[0] - p[0]) * (r[1] - q[1]);
    return 1 + +(val > 0) - +(val === 0);
}
function onSegment(p, q, r) {
    return (q[0] <= Math.max(p[0], r[0]) && q[0] >= Math.min(p[0], r[0]) &&
        q[1] <= Math.max(p[1], r[1]) && q[1] >= Math.min(p[1], r[1]));
}
function segmentsIntersect(p1, q1, p2, q2) {
    const o1 = segmentOrientation(p1, q1, p2);
    const o2 = segmentOrientation(p1, q1, q2);
    const o3 = segmentOrientation(p2, q2, p1);
    const o4 = segmentOrientation(p2, q2, q1);
    return (o1 !== o2 && o3 !== o4 || o1 === 0 && onSegment(p1, p2, q1) || o2 === 0 && onSegment(p1, q2, q1) || o3 === 0 && onSegment(p2, p1, q2) || o3 === 0 && onSegment(p2, p1, q2)
        || o4 === 0 && onSegment(p2, q1, q2));
}
function insidePolygon(point, shape, startPoint, endPoint, segmentEndPoint) {
    let intersectionCount = 0;
    startPoint = shape[shape.length - 1];
    point[0] += 0.5;
    point[1] += 0.5;
    for (let i = 0; i < shape.length; ++i) {
        endPoint[0] = shape[i][0];
        endPoint[1] = shape[i][1];
        segmentEndPoint[0] = 1000000000;
        segmentEndPoint[1] = point[1] + 1;
        if (segmentsIntersect(point, segmentEndPoint, startPoint, endPoint)) {
            if (segmentOrientation(startPoint, point, endPoint) === 0)
                return onSegment(startPoint, point, endPoint);
            intersectionCount++;
        }
        startPoint = shape[i];
    }
    return (intersectionCount & 1) === 1;
}
;
self.onmessage = function handleMessage(message) {
    const data = message.data;
    const result = [];
    const shape = data.polygon;
    if (shape.length > 2) {
        let startPoint = [0, 0];
        const endPoint = [0, 0];
        const segmentEndPoint = [0, 0];
        const point = [0, 0];
        for (let i = data.start; i < data.end; ++i) {
            point[0] = i % data.width;
            point[1] = Math.floor(i / data.width);
            result.push(insidePolygon(point, shape, startPoint, endPoint, segmentEndPoint));
        }
        self.postMessage({ start: data.start, end: data.end, result: result });
    }
};
