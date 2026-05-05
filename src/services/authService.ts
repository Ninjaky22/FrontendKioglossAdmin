import httpClient from './httpClient';
import { forgotPasswordUrl, resetPasswordUrl } from '../constants/serviceUrl';

export const forgotPasswordService = (email: string) =>
  httpClient.post(forgotPasswordUrl, { email }, undefined, false);

export const resetPasswordService = (token: string, newPassword: string) =>
  httpClient.post(resetPasswordUrl, { token, newPassword }, undefined, false);
