import { api } from '@utils';
import { useRouter } from 'next/router';
import { useRef, useState } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import { Loader } from '@components';
import 'react-image-crop/dist/ReactCrop.css';

const TO_RADIANS = Math.PI / 180;

function canvasPreview(
  image,
  crop,
  { fileName, fileUrl },
  scale = 1,
  rotate = 0,
) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  // devicePixelRatio slightly increases sharpness on retina devices
  // at the expense of slightly slower render times and needing to
  // size the image back down if you want to download/upload and be
  // true to the images natural size.
  const pixelRatio = window.devicePixelRatio;
  // const pixelRatio = 1

  canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
  canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

  ctx.scale(pixelRatio, pixelRatio);
  ctx.imageSmoothingQuality = 'high';

  const cropX = crop.x * scaleX;
  const cropY = crop.y * scaleY;

  const rotateRads = rotate * TO_RADIANS;
  const centerX = image.naturalWidth / 2;
  const centerY = image.naturalHeight / 2;

  ctx.save();

  // 5) Move the crop origin to the canvas origin (0,0)
  ctx.translate(-cropX, -cropY);
  // 4) Move the origin to the center of the original position
  ctx.translate(centerX, centerY);
  // 3) Rotate around the origin
  ctx.rotate(rotateRads);
  // 2) Scale the image
  ctx.scale(scale, scale);
  // 1) Move the center of the image to the origin (0,0)
  ctx.translate(-centerX, -centerY);
  ctx.drawImage(
    image,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
  );

  ctx.restore();

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        //reject(new Error('Canvas is empty'));
        console.error('Canvas is empty');
        return;
      }
      blob.name = fileName;
      window.URL.revokeObjectURL(fileUrl);
      resolve({ fileUrlLocal: fileUrl, blobData: blob });
    }, 'image/jpeg');
  });
}

export const ProfilePicCrop = ({ src, closeDetailAction }) => {
  const [crop, setCrop] = useState();
  const [fileUrl, setFileUrl] = useState(null);
  const [blobData, setBlobData] = useState(null);
  const [completedCrop, setCompletedCrop] = useState();
  const [croppedImageUrl, setCroppedImageUrl] = useState('');
  const [aspect, setAspect] = useState(1 / 1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const imgRef = useRef(null);

  const onImageLoaded = async (e) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, aspect));
  };

  const centerAspectCrop = (mediaWidth, mediaHeight, aspect) => {
    return centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspect,
        mediaWidth,
        mediaHeight,
      ),
      mediaWidth,
      mediaHeight,
    );
  };

  const onCropComplete = (crop) => {
    makeClientCrop(crop);
  };

  const makeClientCrop = async (crop) => {
    if (imgRef && crop.width && crop.height) {
      const { fileUrlLocal, blobData } = await canvasPreview(
        imgRef.current,
        crop,
        {
          fileName: 'newFile.jpeg',
          fileUrl,
        },
      );
      setFileUrl(fileUrlLocal);
      setBlobData(blobData);
      setCroppedImageUrl(fileUrl);
    }
  };

  /* const getCroppedImg = (image, crop, fileName) => {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height,
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          //reject(new Error('Canvas is empty'));
          console.error("Canvas is empty");
          return;
        }
        blob.name = fileName;
        window.URL.revokeObjectURL(fileUrl);
        setFileUrl(window.URL.createObjectURL(blob));
        resolve({ fileUrl: fileUrl, blobData: blob });
      }, "image/jpeg");
    });
  }; */

  const updateProfilePicAction = async () => {
    setLoading(true);
    try {
      await makeClientCrop(crop);
      // console.log(blobData);
      const file = new File([blobData], 'newFile.jpeg', {
        lastModified: new Date(),
      });
      const body = new FormData();
      body.append('profilePic', file);
      const { status, error: errorMessage } = await api.postFormData({
        path: 'updateProfilePic',
        body,
      });
      if (status === 400) {
        throw new Error(errorMessage);
      }
      router.reload(window.location.pathname);
    } catch (ex) {
      console.log(ex);
    }
    setLoading(false);
  };

  return (
    <div className="alert__modal modal-window modal-window_no-log modal fixed-right fade active show">
      <div className=" modal-dialog modal-dialog-centered active">
        <div className="modal-content">
          {loading && <Loader />}
          <h2 className="modal-content-title">Edit Profile Pic</h2>
          <table id="prodile-pic-crop-wrapper">
            <tbody>
              <tr>
                <td>
                  {src && (
                    <ReactCrop
                      crop={crop}
                      onChange={(_, percentCrop) => setCrop(percentCrop)}
                      onComplete={onCropComplete}
                      aspect={1}
                    >
                      <img
                        ref={imgRef}
                        alt="Crop me"
                        src={src}
                        style={{ transform: `scale(1) rotate(0deg)` }}
                        onLoad={onImageLoaded}
                      />
                    </ReactCrop>
                  )}
                  {/* {croppedImageUrl && <img alt="Crop" style={{ maxWidth: '100%' }} src={croppedImageUrl} />} */}
                </td>
              </tr>
            </tbody>
          </table>
          <p className="tw-flex tw-justify-end">
            <a
              href="#"
              className="btn btn-lg btn-secondary tw-mr-4 tw-mt-6"
              onClick={updateProfilePicAction}
            >
              Update Profile Pic
            </a>
            <a
              href="#"
              className="btn btn-lg btn-outline tw-mt-6"
              onClick={closeDetailAction}
            >
              Cancel
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
