import { useState } from 'react';

export default () => {
  const [imageFront, setImageFront] = useState<ImageModel>();
  const [imageBack, setImageBack] = useState<ImageModel>();

  return {
    imageFront,
    setImageFront,
    imageBack,
    setImageBack,
  };
};
