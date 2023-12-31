import React, { ChangeEventHandler } from "react";
import { UseFormRegisterReturn } from "react-hook-form";
import { STYLES } from "../utils/consts";

interface FormInputProps {
  id: string;
  type: string;
  register?: UseFormRegisterReturn;
  onChange?: ChangeEventHandler;
  required?: boolean;
}

export default function FormInput({
  id,
  type,
  register,
  required,
  onChange,
}: FormInputProps) {
  const label = (id: string) => {
    switch (id) {
      case "firstName":
        return "first name";
      case "lastName":
        return "last name";
      case "passCheck":
        return "verify your password";
      default:
        return id;
    }
  };
  return (
    <div className="mt-10">
      <label className={STYLES.LABEL} htmlFor={id}>
        {label(id)}:{" "}
      </label>
      <input
        className={STYLES.FORM_INPUT}
        id={id}
        type={type}
        {...register}
        autoComplete="off"
        required={required ? required : false}
        onChange={onChange}
      />
    </div>
  );
}
