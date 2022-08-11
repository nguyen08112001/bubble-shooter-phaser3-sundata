enum BallColor {
  // Red = 0xdb0b0b,
  // Green = 0x0bdb23,
  // Yellow = 0xdbc60b,

  Red = 0xff0000,
  Green = 0x00ff00,
  Yellow = 0xffff00,

  Any = -1,
}

const colorIsMatch = (first: BallColor, second: BallColor) => {
  if (first === BallColor.Any || second === BallColor.Any) {
    return true;
  }

  return first === second;
};

export default BallColor;

export { colorIsMatch };
