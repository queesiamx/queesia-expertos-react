// src/components/GoogleLoginWithRole.jsx — RTC-CO
import React from "react";
import LoginButton from "./LoginButton";

export default function GoogleLoginWithRole() {
  return (
    <div className="w-full flex items-center justify-center">
      <LoginButton /* defaultRole={ROLES.EXPERTO} */ />
    </div>
  );
}
