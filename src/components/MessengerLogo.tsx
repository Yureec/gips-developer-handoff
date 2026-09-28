import maxLogo from '../assets/messengers/max.webp';

type Messenger = 'max' | 'achat' | 'telegram';

interface MessengerLogoProps {
  messenger: Messenger;
}

// A-Chat and Telegram paths mirror the matching Alfa Design System brand icons.
// MAX uses the current product artwork supplied by the portal owner.
export function MessengerLogo({ messenger }: MessengerLogoProps) {
  if (messenger === 'telegram') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" focusable="false">
        <path d="M2.512 11.18c5.906-2.682 9.844-4.45 11.814-5.304C19.952 3.438 21.121 3.014 21.883 3c.168-.003.542.04.785.246.205.173.261.407.288.571.027.165.06.539.034.831-.305 3.339-1.624 11.44-2.295 15.178-.284 1.582-.843 2.113-1.384 2.165-1.177.112-2.07-.81-3.21-1.589-1.782-1.218-2.79-1.976-4.52-3.165-2-1.373-.704-2.128.436-3.362.298-.323 5.482-5.236 5.582-5.682.012-.055.024-.263-.094-.373-.119-.11-.294-.072-.42-.042-.179.042-3.027 2.004-8.545 5.886-.808.578-1.54.86-2.197.845-.723-.016-2.114-.426-3.149-.776-1.268-.43-2.276-.657-2.189-1.387.046-.38.548-.77 1.507-1.167Z" />
      </svg>
    );
  }

  if (messenger === 'achat') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" focusable="false">
        <path d="M12.061 21.905c5.49 0 9.939-4.456 9.939-9.953C22 6.456 17.55 2 12.061 2s-9.938 4.456-9.938 9.952c0 1.813.484 3.513 1.33 4.977.232.402-.23 1.42-.694 2.44-.497 1.096-.996 2.195-.636 2.536.314.298 1.485-.159 2.641-.61 1.07-.418 2.129-.83 2.482-.634a9.883 9.883 0 0 0 4.815 1.244Zm4.846-4.98a6.95 6.95 0 0 0 2.037-4.916h-3.906a3.047 3.047 0 0 1-5.204 2.155 3.047 3.047 0 0 1-.893-2.155H5.036a6.95 6.95 0 0 0 6.954 6.951 6.955 6.955 0 0 0 4.917-2.036Z" fillRule="evenodd" clipRule="evenodd" />
      </svg>
    );
  }

  return <img src={maxLogo} alt="" />;
}
