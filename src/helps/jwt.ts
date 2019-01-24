import * as jwt from 'jsonwebtoken';

const secret : string = process.env.KEY_JWT || 'secret-key';
const option : object = {
  algorithm: process.env.JWT_ALGORITHM || 'HS256',
  expiresIn: process.env.JWT_EXPIRES_IN ? `${process.env.JWT_EXPIRES_IN}d`: '30d',
  issuer: process.env.JWT_ISSUER || 'v-next'
} 

export function sign(payload: any) {
  const token = jwt.sign(payload, secret, option);
  return token;
}

export function verify(token: string) {
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    return false;
  }
}

export function decode(token: string) {
  return jwt.decode(token, {complete: true});
}