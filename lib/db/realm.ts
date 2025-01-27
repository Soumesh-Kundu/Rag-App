
import { setCookie } from "@/app/_action";
type UserCreds={
  name:string,
  email:string,
  password:string
}
export const MongoRealm={}
export const app = {};
export let currentUser = {};

export let mongo = {};
export async function realmConfirmUser({token,tokenId}:{token:string,tokenId:string}) {
    return {}
  try {
    await app.emailPasswordAuth.confirmUser({token, tokenId});
    return true;
  } catch (error) {
    console.error("Error confirming user:", error);
    return null;
  }
}
export async function registerEmailPassword (values: UserCreds) {
  
  return {}
};
export async function serverUser(){
    return {}
  const credentials=Realm.Credentials.apiKey(process.env.SERVER_API_KEY as string)
  const serverUser=await app.logIn(credentials)
  return serverUser
}
export async function loginEmailPassword (email: string, password: string) {
return {}
  try {
    const credentials = Realm.Credentials.emailPassword(email, password);
    const user=await app.logIn(credentials);  
    await setCookie(user.accessToken as string)
    return user
  } catch (error) {
    console.error("Error logging in:", error);
    return null;
  }
};

export async function googlelogin(){
    return {}
  const redirectURI = `${window.location.protocol}//${window.location.host}/callback`;
  try {
    const credentials = Realm.Credentials.google({
      redirectUrl: redirectURI,
    });
    const user=await app.logIn(credentials);
    await setCookie(user.accessToken as string)
    return user
  } catch (error) {
    console.log(error)
    return null
  }
}