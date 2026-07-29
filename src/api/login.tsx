import { supabase } from "@/lib/supabase";


interface LoginData {
  email: string;
  password: string;
}


export async function loginApi(data: LoginData) {

  const { data: response, error } =
    await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });


  if (error) {
    throw error;
  }


  return response;
}