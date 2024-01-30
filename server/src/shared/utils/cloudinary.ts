import cloudinary, { UploadApiResponse } from 'cloudinary';

cloudinary.v2.config({
   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
   api_key: process.env.CLOUDINARY_API_KEY,
   api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const cloudinaryUploadImage = async (fileToUpload: string) => {
   try {
      const data = (await cloudinary.v2.uploader.upload(fileToUpload, {
         resource_type: 'auto',
      })) as UploadApiResponse;
      return data;
   } catch (err) {
      return err;
   }
};

export const cloudinaryRemoveImage = async (imagePublicId: string) => {
   try {
      const result = await cloudinary.v2.uploader.destroy(imagePublicId);
      return result;
   } catch (err) {
      return err;
   }
};

export const cloudinaryRemoveMultipleImage = async (publicIds: string[]) => {
   try {
      const result = await cloudinary.v2.api.delete_resources(publicIds);
      return result;
   } catch (err) {
      console.log(err);
   }
};
