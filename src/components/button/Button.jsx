import { Button as MuiButton } from '@mui/material';

export const Button = ({ text, onClick, href }) => {
  return (
    <MuiButton
      variant="contained"
      onClick={onClick}
      href={href || ''}
      sx={{
        backgroundColor: '#5A7D7C',
        color: 'white !important',
        display: 'block',
        fontSize: 14,
        padding: 1,
        mt: 3,
        mb: 3
      }}
    >
      {text}
    </MuiButton>
  )
}

export default Button;