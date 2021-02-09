import {
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
} from "@chakra-ui/react";

interface NumericInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const NumericInput = ({ id, label, value, onChange }: NumericInputProps) => (
  <FormControl id={id}>
    <FormLabel>{label}</FormLabel>
    <Input
      type="number"
      value={value}
      onChange={(v) => onChange(v.currentTarget.value)}
    />
    <FormHelperText>
      The {label.toLowerCase()} of your image in pixels
    </FormHelperText>
  </FormControl>
);

export default NumericInput;
