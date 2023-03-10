import { TextField } from "@mui/material";
import colors from '../../styles/_colors.scss';

export const NumericInput = ({ id, label, onChange, value }) => {
  return (
    <TextField
      id={id}
      label={label}
      value={value}
      variant="filled"
      onChange={onChange}
      onKeyPress={(event) => {
        if (!/[0-9]/.test(event.key)) {
          event.preventDefault();
        }
      }}			
      sx={{
        input: { color: colors.primaryTextColor },
        label: { color: colors.labelTextColor },
      }}
    />
  )
}

export default NumericInput;