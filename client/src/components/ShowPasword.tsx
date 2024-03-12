import React from "react";
import { STYLES } from "../utils/styles";
import { Eye, EyeOffIcon } from "lucide-react";

type Params = {
  onClick: any;
  show: boolean;
};

export default function ShowPassword({ onClick, show }: Params) {
  return (
    <i className={STYLES.EYE} onClick={onClick}>
      {!show ? <EyeOffIcon /> : <Eye />}
    </i>
  );
}
