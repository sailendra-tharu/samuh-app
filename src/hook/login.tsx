import { useMutation } from "@tanstack/react-query";
import { loginApi } from "@/api/login";


export function useLogin() {

  return useMutation({
    mutationFn: loginApi,
  });

}