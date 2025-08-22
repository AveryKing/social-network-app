"use client";
export default function AuthButton() {
  const handleLogin = async () => {
    console.log("Login button clicked");
  };
  return <button onClick={handleLogin}>Login</button>;
}
