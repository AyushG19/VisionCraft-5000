import { IconCheck, IconCopy } from "@tabler/icons-react";
import AvatarGroup from "./ui/AvatarGroup";
import { useState } from "react";
import { UserInfo } from "@repo/hooks";

const ChatTop = ({ slug, avatars }: { slug: string; avatars: UserInfo[] }) => {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const showFeedBack = () => {
    setIsCopied(true);
    const t = setTimeout(() => {
      setIsCopied(false);
    }, 1000);
    return () => clearTimeout(t);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(slug);
    showFeedBack();
  };
  return (
    <div className=" w-full absolute top-0 left-0 z-30 p-2">
      {/* <div className="flex outline h-8 rounded-md"> */}
      {/* <h3 className="capitalize font-google-sans-code  ">code:</h3> */}
      {/* <h1 className="text-2xl font-google-sans-code px-2 ">{slug}</h1> */}
      <div className="flex items-center justify-between bg-primary outline-1 outline-global-shadow px-6 py-2 rounded-lg h-fit">
        <div className="flex flex-col">
          <div
            className=" capitalize text-[10px]  "
            style={{
              // fontSize: 9,
              // color: C.slate,
              // fontWeight: 700,
              letterSpacing: ".1em",
              fontFamily: "'Plus Jakarta Sans',sans-serif",
              // textTransform: "uppercase",
            }}
          >
            Name
          </div>
          <div
            className="flex gap-1 items-center justify-center hover:bg-secondary bg-primary-700 transition-colors px-2.5 -ml-2 py-0.5 cursor-pointer rounded-md font-google-sans-code font-medium text-xl "
            onClick={handleCopy}
            style={{
              letterSpacing: ".04em",
            }}
          >
            {slug}

            {!isCopied ? (
              <IconCopy stroke={1.5} size={15} />
            ) : (
              <IconCheck color="green" size={18} />
            )}
          </div>
        </div>
        {/* </div> */}
        <div
          className=" capitalize text-[10px] text-primary-contrast text-start h-full "
          style={{
            // fontSize: 9,
            // color: C.slate,
            // fontWeight: 700,
            letterSpacing: ".1em",
            fontFamily: "'Plus Jakarta Sans',sans-serif",
            // textTransform: "uppercase",
          }}
        >
          online
          <AvatarGroup size={25} avatars={avatars} />
        </div>
      </div>
    </div>
  );
};

export default ChatTop;
