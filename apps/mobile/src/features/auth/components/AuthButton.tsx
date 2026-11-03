import { Button } from '../../../components/Button';

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
};

export function AuthButton(props: Props) {
  return <Button {...props} />;
}
