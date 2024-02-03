import joi from 'joi';
import passwordComplexity from 'joi-password-complexity';

export function createUserValidate(obj: Object) {
   const schema = joi.object({
      username: joi.string().trim().min(2).max(30).required(),
      email: joi.string().trim().min(5).max(50).required().email(),
      password: passwordComplexity().required(),
      isAdmin: joi.boolean().required(),
   });
   return schema.validate(obj);
}

export function updateUserVAlidate(obj: Object) {
   const schema = joi.object({
      username: joi.string().trim().min(2).max(30),
      password: passwordComplexity().required(),
      bio: joi.string().trim().min(8),
   });
   return schema.validate(obj);
}
