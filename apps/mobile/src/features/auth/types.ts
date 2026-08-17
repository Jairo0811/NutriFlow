export type AuthSession = {
  userId: string;
  email: string;
  displayName: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAtUtc: string;
  refreshTokenExpiresAtUtc: string;
};

export type AuthCredentials = {
  email: string;
  password: string;
};

export type RegistrationData = AuthCredentials & {
  displayName: string;
};

export type ForgotPasswordResponse = {
  message: string;
  developmentResetToken?: string | null;
};
