import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

let landmarker;
self.onmessage=async({data})=>{
  if(data.type==='init') {
    try {
      if(!await FilesetResolver.isSimdSupported(true))throw new Error('此浏览器不支持本地手势识别');
      const vision=await FilesetResolver.forVisionTasks(data.root,true);
      landmarker=await HandLandmarker.createFromOptions(vision,{
        baseOptions:{modelAssetPath:data.model,delegate:'CPU'},runningMode:'IMAGE',numHands:1,
        minHandDetectionConfidence:.6,minHandPresenceConfidence:.6,minTrackingConfidence:.55,
        canvas:new OffscreenCanvas(640,480),
      });
      self.postMessage({type:'ready'});
    } catch(error) {self.postMessage({type:'error',message:error.message});}
  } else if(data.type==='frame') {
    try {
      // Re-detect each sampled frame so a fast fist/palm change can reacquire the hand.
      const result=landmarker.detect(data.bitmap);
      self.postMessage({type:'landmarks',points:result.landmarks[0]||null,worldPoints:result.worldLandmarks[0]||null});
    } catch(error) {self.postMessage({type:'error',message:error.message});}
    finally {data.bitmap.close();}
  }
};
