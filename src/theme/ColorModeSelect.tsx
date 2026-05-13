import { useColorScheme } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectProps } from '@mui/material/Select';

export default function ColorModeSelect(props: SelectProps) {
  const { mode, setMode } = useColorScheme();
  if (!mode) {
    return null;
  }
  return (
    <Select
      value={mode === 'system' ? 'light' : mode}
      onChange={(event) =>
        setMode(event.target.value as 'light' | 'dark')
      }
      SelectDisplayProps={{
        // @ts-ignore
        'data-screenshot': 'toggle-mode',
      }}
      {...props}
    >
      <MenuItem value="light">Claro</MenuItem>
      <MenuItem value="dark">Oscuro</MenuItem>
    </Select>
  );
}
