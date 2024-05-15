import { Eye, EyeOffIcon } from "lucide-react";

type Params = {
  onClick: any;
  show: boolean;
};

export default function ShowPassword({ onClick, show }: Params) {
  return (
    <i
      className="flex ml-[321.87px] md:ml-[22.5rem] -mt-[35px] md: -mt-[1.9rem]"
      onClick={onClick}
    >
      {!show ? <EyeOffIcon /> : <Eye />}
    </i>
  );
}
