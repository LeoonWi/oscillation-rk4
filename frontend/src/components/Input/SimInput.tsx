import { ChangeEvent } from "react";

type Props = {
    text: string,
    value: number;
    onChange: (value: number) => void;
    placeholder?: string
}

const SimInput = (props: Props) => {
  return (
    <label>{ props.text }
      <input
          required
          type="number"
          value={props.value}
          onChange={(e) => props.onChange(parseFloat(e.target.value))}
          className="text-black dark:text-white border-2 border-solid border-icon-hover rounded-[3px] w-18 h-[30px] outline-icon-active mb-1 ml-1"
      />
    </label>
  )
}

export default SimInput