export type SignInFormState = {
  error: string | null;
  success: string | null;
};

export const initialSignInFormState: SignInFormState = {
  error: null,
  success: null,
};
