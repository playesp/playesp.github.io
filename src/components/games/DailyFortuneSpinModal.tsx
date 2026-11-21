import React from 'react';
import type { UserProfile } from '../../types/index.ts';
import { DailyLuckySpin } from './DailyLuckySpin.tsx';

interface DailyFortuneSpinModalProps {
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onClose?: () => void;
  isModal?: boolean;
  onOpenBuyCoins?: () => void;
}

export const DailyFortuneSpinModal: React.FC<DailyFortuneSpinModalProps> = ({
  user,
  onUpdateUser,
  onClose,
  isModal = true,
  onOpenBuyCoins,
}) => {
  return (
    <DailyLuckySpin
      user={user}
      onUpdateUser={onUpdateUser}
      onClose={onClose}
      isModal={isModal}
      onOpenBuyCoins={onOpenBuyCoins}
    />
  );
};
