import React from "react";
import { STYLES } from "../utils/styles/styles";
import { EyeIcon, EyeOff } from "lucide-react";

type Params = {
  onClick: any;
  show: boolean;
};

export default function Eye({ onClick, show }: Params) {
  return (
    <i className={STYLES.EYE}>
      {!show ? <EyeOff onClick={onClick} /> : <EyeIcon onClick={onClick} />}
    </i>
  );
}
