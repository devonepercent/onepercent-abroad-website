// Drawn arrow icon. Used instead of ↗ / → / ← characters, which some phones render as emoji.
const paths = {
  "up-right": "M7 17 17 7M8 7h9v9",
  right: "M5 12h14M13 6l6 6-6 6",
  left: "M19 12H5M11 6l-6 6 6 6",
};

const Arrow = ({ dir = "right" }: { dir?: keyof typeof paths }) => (
  <svg className="op-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={paths[dir]} />
  </svg>
);

export default Arrow;
