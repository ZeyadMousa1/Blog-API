import joi from 'joi';

export function createPostValidation(obj: Object) {
   const schema = joi.object({
      title: joi.string().trim().min(2).max(200).required(),
      description: joi.string().trim().min(10).required(),
      category: joi.string().trim().required(),
   });
   return schema.validate(obj);
}

export function updatePostValidation(obj: Object) {
   const schema = joi.object({
      title: joi.string().trim().min(2).max(200),
      description: joi.string().trim().min(10),
      category: joi.string().trim(),
   });
   return schema.validate(obj);
}
