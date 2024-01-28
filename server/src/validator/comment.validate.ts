import joi from 'joi';

export function validateCreateComment(obj: Object) {
   const schema = joi.object({
      postId: joi.string().required(),
      title: joi.string().required(),
   });
   return schema.validate(obj);
}

export function validateUpdateComment(obj: Object) {
   const schema = joi.object({
      title: joi.string().required(),
   });
   return schema.validate(obj);
}
