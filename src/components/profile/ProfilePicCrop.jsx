import React, { useState } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

export const ProfilePicCrop = ({ src, handleOnCropChange }) => {
  const [crop, setCrop] = useState({ width: 250, aspect: 1 / 1 });
  const [fileUrl, setFileUrl] = useState(null);
  const [blobData, setBlobData] = useState(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState("");

  let imageRef;

  // If you setState the crop in here you should return false.
  const onImageLoaded = (image) => {
    imageRef = image;
  };

  const onCropComplete = (crop) => {
    makeClientCrop(crop);
  };

  const onCropChange = (crop, percentCrop) => {
    // You could also use percentCrop:
    // this.setState({ crop: percentCrop });
    setCrop(crop);
  };

  const makeClientCrop = async (crop) => {
    if (imageRef && crop.width && crop.height) {
      const { fileUrl, blobData } = await getCroppedImg(
        imageRef,
        crop,
        "newFile.jpeg",
      );
      setBlobData(blobData);
      setCroppedImageUrl(fileUrl);
      handleOnCropChange(blobData);
    }
  };

  const getCroppedImg = (image, crop, fileName) => {
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
  };

  return (
    <table id="prodile-pic-crop-wrapper">
      <tbody>
        <tr>
          <td>
            {src && (
              <ReactCrop
                src={src}
                crop={crop}
                ruleOfThirds
                onImageLoaded={onImageLoaded}
                onComplete={onCropComplete}
                onChange={onCropChange}
              />
            )}
            {/* {croppedImageUrl && <img alt="Crop" style={{ maxWidth: '100%' }} src={croppedImageUrl} />} */}
          </td>
        </tr>
      </tbody>
    </table>
  );
};
