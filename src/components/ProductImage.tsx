import goldLogo from '../assets/product-oms.png';

/** Transparent artwork uses its visible bounds instead of the file's empty margins. */
export function ProductImage({ src }: { src: string }) {
  return src === goldLogo
    ? <svg className="product-image-artwork" viewBox="116 38 309 261" aria-hidden="true" focusable="false"><image href={src} width="548" height="336" /></svg>
    : <img src={src} alt="" />;
}
