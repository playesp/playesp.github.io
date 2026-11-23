import React from 'react';
import type { Moment } from '../types/index.ts';
import { getMomentTextClasses } from '../config/momentStyles.ts';

interface MomentPostContentProps {
  moment: Moment;
  compact?: boolean;
}

export const MomentPostContent: React.FC<MomentPostContentProps> = ({ moment, compact = false }) => {
  const { theme, textClassName, effectStyle } = getMomentTextClasses(moment.postStyle);
  const photoFrame = moment.postStyle?.photoFrame || 'clean';

  return (
    <div className="space-y-3">
      {moment.caption && (
        <div
          className={
            theme.isColoredCard
              ? `rounded-2xl ${theme.cardClass} ${
                  compact ? 'px-4 py-6 min-h-[120px]' : 'px-5 py-8 sm:py-10 min-h-[160px]'
                } flex items-center justify-center shadow-sm`
              : ''
          }
        >
          <p
            style={{
              ...effectStyle,
              ...(theme.isColoredCard && !moment.postStyle?.textColor
                ? { color: theme.defaultTextColor }
                : {}),
            }}
            className={`w-full ${textClassName}`}
          >
            {moment.caption}
          </p>
        </div>
      )}

      {moment.imageUrl && (
        <div
          className={`overflow-hidden flex items-center justify-center ${
            photoFrame === 'polaroid'
              ? 'bg-white p-2.5 pb-7 shadow-md rounded-md border border-slate-200'
              : photoFrame === 'rounded_glow'
                ? 'rounded-2xl ring-2 ring-[#1877f2]/70 shadow-lg bg-slate-900/5'
                : photoFrame === 'cinema'
                  ? 'rounded-lg border-y-4 border-slate-900 bg-black'
                  : 'rounded-xl border border-slate-200 bg-[#f9fafb]'
          } ${compact ? 'max-h-72' : 'max-h-[440px]'}`}
        >
          <img
            src={moment.imageUrl}
            alt="Moment attachment"
            className={`w-full h-auto object-contain ${compact ? 'max-h-72' : 'max-h-[430px]'}`}
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
};
