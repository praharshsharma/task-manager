import { SignedIn, SignedOut, SignInButton, UserButton} from "@clerk/clerk-react";

export default function Register() {

    return (
      <header>
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </header>

    )
  }