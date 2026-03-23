import { IconCheck, IconCopy } from "@tabler/icons-react";
import { motion } from "motion/react";
import AvatarGroup from "./ui/AvatarGroup";
import { useState } from "react";

const ChatTop = ({
  slug,
  avatars,
}: {
  slug: string;
  avatars: {
    id: string;
    name: string;
    imageUrl: string;
    color?: string;
  }[];
}) => {
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
    <div className="w-full h-20 flex items-center justify-between bg-light_sky_blue border-b px-6 py-4">
      {/* <div className="flex outline h-8 rounded-md"> */}
      {/* <h3 className="capitalize font-google-sans-code  ">code:</h3> */}
      {/* <h1 className="text-2xl font-google-sans-code px-2 ">{slug}</h1> */}
      <div className="flex flex-col">
        <div
          className="uppercase text-[10px]  "
          style={{
            // fontSize: 9,
            // color: C.slate,
            // fontWeight: 700,
            letterSpacing: ".1em",
            fontFamily: "'Plus Jakarta Sans',sans-serif",
            // textTransform: "uppercase",
          }}
        >
          Room
        </div>
        <div
          className="flex gap-1 items-center justify-center hover:bg-uranian_blue px-2 -ml-2 py-1 cursor-pointer rounded-md font-google-sans-code font-medium text-xl "
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
      <AvatarGroup size={25} avatars={avatars} />
    </div>
  );
};

export default ChatTop;
