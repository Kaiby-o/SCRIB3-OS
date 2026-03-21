import errorGlitch    from '../assets/sounds/Glitchedtones_-_User_Interface_-_Error_Glitch.wav';
import cartridgeSound from '../assets/sounds/cartridge.wav';
import bootSound      from '../assets/sounds/boot.wav';

export const sounds = {
  error:     new Audio(errorGlitch),
  cartridge: new Audio(cartridgeSound),
  boot:      new Audio(bootSound),
};

sounds.cartridge.volume = 1.0;
sounds.error.volume     = 1.0;
sounds.boot.volume      = 0.6;

// All current sounds are SFX — mute 'sfx' or 'all' silences them.
// 'music' mutes music tracks only (none yet), so SFX still play.
export function playSound(key: keyof typeof sounds) {
  if (localStorage.getItem('scrib3-aesthetic') === 'clean') return;
  const mode = localStorage.getItem('scrib3-mute-mode') ?? 'none';
  if (mode === 'all' || mode === 'sfx') return;
  const sound = sounds[key];
  sound.currentTime = 0;
  sound.play().catch(() => {});
}

export function playBootSequence() {
  setTimeout(() => {
    playSound('boot');
  }, 2000);
}
