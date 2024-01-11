import { hash, compare } from 'bcryptjs';

export class PasswordServices {
   private static readonly SALT = 10;

   static async hashPassword(password: string) {
      return await hash(password, this.SALT);
   }

   static async comparePassword(password: string, hashedPassword: string) {
      return await compare(password, hashedPassword);
   }
}
