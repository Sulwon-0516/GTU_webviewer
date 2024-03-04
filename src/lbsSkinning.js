import * as THREE from 'three';

export function lbsSkinning(centerArray, rotationArray, transforms, SplatBuffer) {
    const splatCount = SplatBuffer.splatCount;


    let bucket = [0, 0, 0];
    const center = new THREE.Vector3();
    const rotation = new THREE.Quaternion();
    const rotationMatrix = new THREE.Matrix3();
    const lbsrotationMatrix = new THREE.Matrix3();
    const tempMatrix4 = new THREE.Matrix4();

    function thf(f, compressionLevel) {
        if (compressionLevel === 0) {
            return f;
        } else {
            return THREE.DataUtils.toHalfFloat(f);
        }
    }

    const LbsWeightComponentCount = 24;
    const CenterComponentCount = 3;
    const RotationComponentCount = 4;

    for (let i = 0; i < splatCount; i++) {
        // Get lbs skinning weights (lbsTransform)
        const LbsWeightBase = i * LbsWeightComponentCount;
        const lbsTransform = new THREE.Matrix4();
        let lbsweight = 0;
        const jointTransform = new THREE.Matrix4();
        for (let j=0; j <24; j++) {
            lbsweight = SplatBuffer.fbf(SplatBuffer.lbsweightArray[LbsWeightBase+j]);
            jointTransform.copy(transforms[j])
            jointTransform.multiplyScalar(lbsweight)
            if (j==0){
                lbsTransform.copy(jointTransform);
            }
            else{
                for (let i = 0; i < lbsTransform.elements.length; i++) {
                    lbsTransform.elements[i] = lbsTransform.elements[i] + jointTransform.elements[i];
                  }
            }
        }

        // Move Centers first
        const centerSrcBase = i * CenterComponentCount;
        if (SplatBuffer.compressionLevel > 0) {
            const bucketIndex = Math.floor(i / SplatBuffer.bucketSize);
            bucket = new Float32Array(SplatBuffer.splatBufferData, SplatBuffer.bucketsBase + bucketIndex * SplatBuffer.bytesPerBucket, 3);
            const sf = SplatBuffer.compressionScaleFactor;
            const sr = SplatBuffer.compressionScaleRange;
            center.x = (centerArray[centerSrcBase] - sr) * sf + bucket[0];
            center.y = (centerArray[centerSrcBase + 1] - sr) * sf + bucket[1];
            center.z = (centerArray[centerSrcBase + 2] - sr) * sf + bucket[2];
        } else {
            center.x = centerArray[centerSrcBase];
            center.y = centerArray[centerSrcBase + 1];
            center.z = centerArray[centerSrcBase + 2];
        }
        // 'transform' is assumed to be a single Matrix4
        center.applyMatrix4(lbsTransform);

        SplatBuffer.centerArray[centerSrcBase] = thf(center.x, SplatBuffer.compressionLevel);
        SplatBuffer.centerArray[centerSrcBase + 1] = thf(center.y, SplatBuffer.compressionLevel);
        SplatBuffer.centerArray[centerSrcBase + 2] = thf(center.z, SplatBuffer.compressionLevel);


        // Move Rotations
        const rotationBase = i * RotationComponentCount;
        rotation.set(SplatBuffer.fbf(rotationArray[rotationBase + 1]),
                     SplatBuffer.fbf(rotationArray[rotationBase + 2]),
                     SplatBuffer.fbf(rotationArray[rotationBase + 3]),
                     SplatBuffer.fbf(rotationArray[rotationBase]));
        tempMatrix4.makeRotationFromQuaternion(rotation);
        rotationMatrix.setFromMatrix4(tempMatrix4);
        lbsrotationMatrix.setFromMatrix4(lbsTransform);
        rotationMatrix.premultiply(lbsrotationMatrix);
        tempMatrix4.set(
            rotationMatrix.elements[0], rotationMatrix.elements[1], rotationMatrix.elements[2], 0,
            rotationMatrix.elements[3], rotationMatrix.elements[4], rotationMatrix.elements[5], 0,
            rotationMatrix.elements[6], rotationMatrix.elements[7], rotationMatrix.elements[8], 0,
            0, 0, 0, 1
          );
        rotation.setFromRotationMatrix(tempMatrix4);

        SplatBuffer.rotationArray[rotationBase] = thf(rotation.x, SplatBuffer.compressionLevel);
        SplatBuffer.rotationArray[rotationBase + 1] = thf(rotation.y, SplatBuffer.compressionLevel);
        SplatBuffer.rotationArray[rotationBase + 2] = thf(rotation.z, SplatBuffer.compressionLevel);
        SplatBuffer.rotationArray[rotationBase + 3] = thf(rotation.w, SplatBuffer.compressionLevel);
    }

    console.log('finished lbs')
}