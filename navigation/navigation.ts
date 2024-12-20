import { useRouter } from "expo-router";

export const useNavigationHelpers = () => {
  const router = useRouter();

  return {
    navigateToLogin: () => router.push("/register_login/login"),
    navigateToRegister: () => router.push("/register_login/register"),
    navigateToHome: () => router.push("/home_page/home"),
    navigateToProfile: () => router.push("/profile/my_profile"),
  };
};
