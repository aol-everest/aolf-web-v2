import React, { useState } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { api } from "@utils";
import { useRouter } from "next/router";

export const ProfilePicCrop = ({ src, closeDetailAction }) => {
  const [crop, setCrop] = useState({ width: 250, aspect: 1 / 1 });
  const [fileUrl, setFileUrl] = useState(null);
  const [blobData, setBlobData] = useState(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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

  const updateProfilePicAction = async () => {
    setLoading(true);
    try {
      const file = new File([blobData], "newFile.jpeg", {
        lastModified: new Date(),
      });
      const body = new FormData();
      body.append("profilePic", file);
      const { status, error: errorMessage } = await api.post({
        path: "updateProfilePic",
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
          {loading && <div className="cover-spin"></div>}
          <h2 className="modal-content-title">Edit Profile Pic</h2>
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
          <p className="tw-flex tw-justify-end">
            <a
              href="#"
              className="tw-mt-6 btn btn-lg btn-secondary tw-mr-4"
              onClick={updateProfilePicAction}
            >
              Update Profile Pic
            </a>
            <a
              href="#"
              className="tw-mt-6 btn btn-lg btn-outline"
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
