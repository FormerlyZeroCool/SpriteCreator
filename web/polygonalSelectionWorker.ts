function segmentOrientation(p:number[], q:number[], r:number[]):number
{
    const val:number = (q[1] - p[1]) * (r[0] - q[0]) -
              (q[0] - p[0]) * (r[1] - q[1]);
    return 1 + <number> <any> (val > 0) - <number> <any> (val === 0); 
}
function onSegment(p:number[], q:number[], r:number[]):boolean
{
    return (q[0] <= Math.max(p[0], r[0]) && q[0] >= Math.min(p[0], r[0]) &&
            q[1] <= Math.max(p[1], r[1]) && q[1] >= Math.min(p[1], r[1]))
}
function segmentsIntersect(p1:number[], q1:number[], p2:number[], q2:number[]):boolean
{
    const o1:number = segmentOrientation(p1, q1, p2);
    const o2:number = segmentOrientation(p1, q1, q2);
    const o3:number = segmentOrientation(p2, q2, p1);
    const o4:number = segmentOrientation(p2, q2, q1);
    return (o1 !== o2 && o3 !== o4 || o1 === 0 && onSegment(p1, p2, q1) || o2 === 0 && onSegment(p1, q2, q1) || o3 === 0 && onSegment(p2, p1, q2) || o3 === 0 && onSegment(p2, p1, q2)
      || o4 === 0 && onSegment(p2, q1, q2));
}
function insidePolygon(point:number[], shape:number[][], startPoint:number[], endPoint:number[], segmentEndPoint:number[]):boolean
{
    let intersectionCount:number = 0;
    startPoint = shape[shape.length - 1];
    point[0] += 0.5;
    point[1] += 0.5;
    for(let i = 0; i < shape.length; ++i)
    {
        endPoint[0] = shape[i][0]
        endPoint[1] = shape[i][1];
        segmentEndPoint[0] = 1000000000;
        segmentEndPoint[1] = point[1] + 1;
        if(segmentsIntersect(point, segmentEndPoint, startPoint, endPoint))
        {
            if (segmentOrientation(startPoint, point, endPoint) === 0)
                return onSegment(startPoint, point, endPoint);
            intersectionCount++;
        }
        startPoint = shape[i];
    }
    return (intersectionCount & 1) === 1;
}
interface MessageData {
    start:number;
    end:number;
    height:number;
    width:number;
    polygon:number[][];
};
function sleep(ms:number):Promise<void> {
    return new Promise<void>((resolve:any) => setTimeout(resolve, ms));
}
self.onmessage = function handleMessage(message) {
    const data:MessageData = message.data;
    const result:Uint8Array = new Uint8Array(data.end - data.start);
    const shape:number[][] = data.polygon;
    if(shape.length > 2)
    {
        let startPoint:number[] = [0, 0];
        const endPoint:number[] = [0, 0];
        const segmentEndPoint:number[] = [0, 0];
        const point:number[] = [0, 0];
        for(let i = data.start; i < data.end; ++i)
        {
            point[0] = i % data.width;
            point[1] = Math.floor(i / data.width);
            result[i - data.start] = +(insidePolygon(point, shape, startPoint, endPoint, segmentEndPoint));
        }
        const answer = {start:data.start, end:data.end, result:result};
        sleep(Math.random() * 30);
        self.postMessage(answer, null, [answer.result.buffer]);
    }
};