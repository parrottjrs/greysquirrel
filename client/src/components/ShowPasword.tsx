import React from "react";
import { STYLES } from "../utils/styles/styles";
import { Eye, EyeOffIcon } from "lucide-react";

type Params = {
  onClick: any;
  show: boolean;
};

export default function ShowPassword({ onClick, show }: Params) {
  return (
    <i
      className="flex ml-[13.5rem] md:ml-[22.5rem] -mt-[1.9rem]"
      onClick={onClick}
    >
      {!show ? <EyeOffIcon /> : <Eye />}
    </i>
  );
}
