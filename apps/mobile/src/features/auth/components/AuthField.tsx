import type { ComponentProps } from 'react';

import { Input } from '../../../components/Input';

type Props = ComponentProps<typeof Input> & { label: string };

export function AuthField({ autoCapitalize, ...props }: Props) {
  return <Input autoCapitalize={autoCapitalize ?? 'none'} {...props} />;
}
