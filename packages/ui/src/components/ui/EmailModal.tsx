"use client";
import React, { useState } from "react";
import { Input } from "./input";
import { Button } from "./button";
import {
  IconArrowNarrowRight,
  IconBrandGithubFilled,
  IconBrandGoogleFilled,
} from "@tabler/icons-react";

type FieldState = {
  label: string;
  state: string;
  setState: React.Dispatch<React.SetStateAction<string>>;
  placeholder: string;
};
const EmailModal = () => {
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [stage, setStage] = useState<number>(0);
  const stages: FieldState[] = [
    {
      label: "email",
      state: email,
      setState: setEmail,
      placeholder: "easy@something.com",
    },
    {
      label: "password",
      state: password,
      setState: setPassword,
      placeholder: "*********",
    },
    {
      label: "confirm password",
      state: confirmPassword,
      setState: setConfirmPassword,
      placeholder: "*********",
    },
    {
      label: "name",
      state: name,
      setState: setName,
      placeholder: "skibidi toilet",
    },
  ];
  const currStage = stages[stage];

  return (
    <div>
      <div className="relative w-full lg:w-110 shadow-primary outline-personal">
        {/* Main modal content */}
        <div className="flex h-full w-full flex-col items-center justify-center gap-5 rounded-[20px] border border-black bg-easy-purple px-6 lg:px-8 py-10 box-shadow-black">
          {/* Email section */}
          <div className="flex flex-col gap-2.5 w-full h-full ">
            <h2 className="font-krona text-4xl text-white text-shadow-primary capitalize">
              {currStage && currStage.label}
            </h2>
            <div className="flex items-center w-full h-fullfl">
              {currStage && (
                <Input
                  value={currStage.state}
                  onInput={(e) => currStage.setState(e.currentTarget.value)}
                  placeholder={currStage?.placeholder}
                  className="bg-easy-purple-muted placeholder:text-easy-bg placeholder:opacity-40 rounded-r-none "
                ></Input>
              )}
              <Button
                onClick={() => setStage((prev) => (prev + 1) % 4)}
                className="w-16 -ml-4  bg-easy-purple-muted text-easy-bg"
                variant={"iconic"}
                size={"xl"}
              >
                <IconArrowNarrowRight />
              </Button>
            </div>
          </div>

          {/* Separator */}
          <div className="flex items-center gap-2 -my-2">
            <div className="h-px w-32 bg-easy-purple-muted" />
            <span className="font-handlee text-lg lowercase text-easy-purple-muted">
              or
            </span>
            <div className="h-px w-32 bg-easy-purple-muted" />
          </div>

          {/* Provider buttons */}
          <div className="flex flex-col gap-4 w-full">
            <Button
              size={"xl"}
              variant={"iconic"}
              className="bg-easy-yellow group"
            >
              <IconBrandGoogleFilled className="text-easy-bg mr-2" />
              <p className=" font-semibold font- text-base text-easy-bg">
                <span className="transition-all duration-500 ease-in-out  max-w-0 text-transparent group-hover:text-easy-bg translate-x-5 group-hover:translate-x-0 inline-block group-hover:scale-100 group-hover:max-w-120 group-hover:mr-1.5">
                  Continue with
                </span>
                Google
              </p>
            </Button>
            <Button
              size={"xl"}
              variant={"iconic"}
              className="bg-easy-lime group"
            >
              <IconBrandGithubFilled className="text-easy-bg mr-2" />
              <p className=" font-semibold font- text-base text-easy-bg">
                <span className="transition-all duration-500 ease-in-out  max-w-0 text-transparent group-hover:text-easy-bg translate-x-5 group-hover:translate-x-0 inline-block group-hover:scale-100 group-hover:max-w-120 group-hover:mr-1.5">
                  Continue with
                </span>
                Github
              </p>
            </Button>
          </div>
        </div>
        {/* Corner markers */}
        <div className="pointer-events-none absolute inset-0 border-2 border-easy-blue">
          <div className="absolute -right-1 -top-1 h-2 w-2 border border-easy-blue bg-gray-300" />
          <div className="absolute -bottom-1 -right-1 h-2 w-2 border border-easy-blue bg-gray-300" />
          <div className="absolute -bottom-1 -left-1 h-2 w-2 border border-easy-blue bg-gray-300" />
          <div className="absolute -left-1 -top-1 h-2 w-2 border border-easy-blue bg-gray-300" />
        </div>
        {/* Hand pointer and dimension label */}
        <svg
          className="dillu absolute left-17/20 top-full -translate-y-1/2"
          width="32"
          height="37"
          viewBox="0 0 32 37"
          fill="none"
        >
          <path
            d="M9.82 20.25V5.375C9.82 4.68 10.1 4.01 10.6 3.52 11.1 3.03 11.77 2.75 12.47 2.75c.7 0 1.38.28 1.87.77.5.49.78 1.16.78 1.86V18.5M15.12 17.63v-3.5c0-.7.28-1.37.78-1.86.49-.49 1.16-.77 1.86-.77.7 0 1.38.28 1.87.77.5.49.78 1.16.78 1.86v4.38M20.41 15.88c0-.7.28-1.37.78-1.86.49-.49 1.16-.77 1.86-.77.7 0 1.38.28 1.87.77.5.49.78 1.16.78 1.86v2.63M25.71 17.63c0-.7.28-1.37.78-1.86.49-.49 1.16-.77 1.86-.77.7 0 1.38.28 1.87.77.5.49.78 1.16.78 1.86v7.88c0 2.78-1.12 5.45-3.1 7.42-2 1.97-4.69 3.08-7.5 3.08h-3.53c-1.75 0-3.48-.43-5.02-1.26-1.54-.82-2.86-2.01-3.82-3.47l-.35-.52c-.55-.84-2.48-4.18-5.8-10.02-.34-.6-.43-1.3-.25-1.96.18-.66.61-1.23 1.2-1.58.63-.37 1.37-.53 2.1-.44.73.09 1.41.42 1.93.93l2.59 2.57"
            stroke="black"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="white"
          />
        </svg>
        <div className="h-px w-full bg-white hidden lg:block lg:absolute lg:-left-1 lg:top-1/2 lg:-translate-x-full lg:-translate-y-1/2"></div>
        <svg
          className="w-4 h-4 absolute top-1/2 left-0 -translate-1/2 -ml-1 "
          viewBox="-1.5 -1.5 18.00 18.00"
          version="1.1"
          id="triangle"
          xmlns="http://www.w3.org/2000/svg"
          stroke="#000000"
          fill="white"
          strokeWidth="0.00015000000000000001"
          transform="rotate(90)"
        >
          <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
          <g
            id="SVGRepo_tracerCarrier"
            strokeLinecap="round"
            strokeLinejoin="round"
            stroke="#CCCCCC"
            strokeWidth="0.09"
          ></g>
          <g id="SVGRepo_iconCarrier">
            <path
              id="path21090-9"
              d="M7.5385,2C7.2437,2,7.0502,2.1772,6.9231,2.3846l-5.8462,9.5385C1,12,1,12.1538,1,12.3077C1,12.8462,1.3846,13,1.6923,13h11.6154C13.6923,13,14,12.8462,14,12.3077c0-0.1538,0-0.2308-0.0769-0.3846L8.1538,2.3846C8.028,2.1765,7.7882,2,7.5385,2z"
            ></path>
          </g>
        </svg>
      </div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[140%] bg-easy-blue px-3 py-1.5 text-xs rounded-sm font-semibold ">
        440 x 355
      </div>
    </div>
  );
};
export default EmailModal;
