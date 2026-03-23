export type selected = "draw" | "ask";

const OPTIONS: { name: selected; desc: string }[] = [
  { name: "draw", desc: "tell AI to draw something." },
  { name: "ask", desc: "ask AI about something." },
];
const OptionModal = ({
  open,
  handleOptionSelect,
}: {
  open: boolean;
  handleOptionSelect: (option: selected) => void;
}) => {
  return (
    <div
      id="option"
      className={` absolute bg-light_sky_blue bottom-0 transform  left-0 w-full h-auto border-t rounded-t-md transition-transform duration-300 text-sm ${open ? "translate-y-0" : "translate-y-full"} `}
    >
      <ul>
        {OPTIONS.map((ob) => (
          <li
            key={ob.name}
            className="px-2 py-2 font-semibold font-handlee even:bg-light_sky_blue-600 cursor-pointer flex gap-3 hover:bg-light_sky_blue-700 hover:rounded-t-md"
            onClick={() => handleOptionSelect(ob.name)}
          >
            /{ob.name}
            <span className="font-google-sans-code text-xs font-normal ">
              {ob.desc}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OptionModal;
