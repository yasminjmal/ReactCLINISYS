// src/services/passwordResetService.js
import api from './api';

const passwordResetService = {
  /**
   * Sends a request to the backend to start the password reset process.
   * @param {string} email The user's email address.
   * @returns {Promise<any>}
   */
  forgotPassword: (email) => {
    return api.post(`/forgot-password?email=${encodeURIComponent(email)}`);
  },

  /**
   * Verifies the reset code sent to the user's email.
   * @param {string} email The user's email address.
   * @param {string} code The verification code.
   * @returns {Promise<any>} The backend response, which should include the reset token.
   */
  verifyCode: (email, code) => {
    return api.post(`/verify-code?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`);
  },

  /**
   * Resets the user's password using the reset token.
   * @param {string} email The user's email.
   * @param {string} newPassword The new password.
   * @param {string} resetToken The token received after code verification.
   * @returns {Promise<any>}
   */
  resetPassword: (email, newPassword, resetToken) => {
    return api.post('/reset-password-jwt', {
      email,
      newPassword,
      resetToken,
    });
  },
};

export default passwordResetService;