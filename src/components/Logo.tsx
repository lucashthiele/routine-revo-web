import svgPaths from "../assets/svg-paths";

function Frame() {
  return (
    <div className="absolute bottom-[22.53%] left-0 right-[22.53%] top-0" data-name="Frame">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 47 51">
        <g clipPath="url(#clip0_3_32)" id="Frame">
          <path d={svgPaths.pacc5680} fill="url(#paint0_linear_3_32)" id="Vector" />
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_3_32" x1="-0.00018487" x2="46.4798" y1="25.1813" y2="25.1813">
            <stop stopColor="#FD9248" />
            <stop offset="0.49" stopColor="#FA1768" />
            <stop offset="0.99" stopColor="#F001FF" />
          </linearGradient>
          <clipPath id="clip0_3_32">
            <rect fill="white" height="50.3511" width="46.4824" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Frame1() {
  return (
    <div className="absolute inset-0 overflow-clip" data-name="Frame">
      <Frame />
    </div>
  );
}

function Group() {
  return (
    <div className="absolute contents inset-0" data-name="Group">
      <div className="absolute inset-0" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
          <g id="Vector"></g>
        </svg>
      </div>
      <Frame1 />
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute contents inset-0" data-name="Group">
      <Group />
    </div>
  );
}

export default function Logo() {
  return (
    <div className="relative size-full" data-name="Logo 1">
      <Group1 />
    </div>
  );
}

