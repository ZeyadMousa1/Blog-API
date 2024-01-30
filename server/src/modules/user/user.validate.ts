import joi from 'joi';

export function validateUpdateUser(obj: Object) {
   const schema = joi.object({
      username: joi.string().trim().min(2).max(30),
      password: joi.string().trim().min(6),
      bio: joi.string().trim().min(8),
   });
   return schema.validate(obj);
}
