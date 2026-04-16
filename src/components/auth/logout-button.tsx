import { signOut } from "@/features/auth/actions/sign-out";

export function LogoutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="app-button-secondary h-10 rounded-full px-4"
      >
        Abmelden
      </button>
    </form>
  );
}
