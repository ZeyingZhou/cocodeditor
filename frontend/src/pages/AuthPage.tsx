import SignInCard from "@/components/auth/sign-in-card";
import SignUpCard from "@/components/auth/sign-up-card";
import { SignInFlow } from "@/lib/types";
import { useState } from "react";
const AuthPage = () => {
    const [state, setState] = useState<SignInFlow>("signIn");

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                 {state === "signIn" ? <SignInCard setState={setState}/> : <SignUpCard setState={setState}/>}
            </div>
      </div>
    )
}
export default AuthPage;