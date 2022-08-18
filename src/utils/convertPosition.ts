interface tmp {
  a: number;
  b: number;
  h: number;
  p: number;
}

let props: tmp = { a: 1, b: 1, h: 1, p: 1 };

let config = {
  topLeftCorner: { x: 100, y: 0 },
  topRightCorner: { x: 275, y: 0 },
  bottomLeftCorner: { x: 0, y: 667 },
};

props.b = config.topRightCorner.x - config.topLeftCorner.x;
props.a =
  props.b + 2 * (config.topLeftCorner.x - config.bottomLeftCorner.x);
props.h = config.bottomLeftCorner.y - config.topLeftCorner.y;
props.p = (props.a * props.h) / (props.a - props.b);

export default props;
