
import * as Realm from "realm-web";
import { setCookie } from "@/app/_action";

export const MongoRealm=Realm
export const app = Realm.getApp(process.env.NEXT_PUBLIC_REALM_APP_ID as string);
export let currentUser = app.currentUser;

export let mongo = app?.currentUser?app.currentUser.mongoClient("mongodb-atlas").db('private-gpt'):null;
export async function realmConfirmUser({token,tokenId}:{token:string,tokenId:string}) {
  try {
    await app.emailPasswordAuth.confirmUser({token, tokenId});
    return true;
  } catch (error) {
    console.error("Error confirming user:", error);
    return null;
  }
}
export async function registerEmailPassword (email: string, password: string) {
  try {
    await app.emailPasswordAuth.registerUser({ email, password });
    return true;
  } catch (error) {
    console.error("Error registering user:", error);
    return null;
  }
};
export async function serverUser(){
  const credentials=Realm.Credentials.apiKey(process.env.SERVER_API_KEY as string)
  const serverUser=await app.logIn(credentials)
  return serverUser
}
export async function loginEmailPassword (email: string, password: string) {
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