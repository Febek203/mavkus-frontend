import logo from "../assets/logo.png";

export default function LoginRegister({ onLogin }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bgDark px-4">
      <div className="
        bg-bgCard/90
        border border-borderSoft
        rounded-3xl
        p-8
        w-full
        max-w-md
        shadow-[0_0_40px_rgba(124,58,237,0.35)]
      ">
        <img
          src={logo}
          alt="logo"
          className="w-20 h-20 mx-auto mb-4 shadow-glow"
        />

        <h2 className="
          text-center
          text-2xl
          font-bold
          bg-gradient-to-r from-primary to-accentCyan
          bg-clip-text text-transparent
        ">
          Benvenuto in Mavkus
        </h2>

        <button
          onClick={onLogin}
          className="
            mt-6
            w-full
            bg-primary
            hover:bg-primaryDark
            text-white
            py-3
            rounded-xl
            font-semibold
            shadow-glowSm
            transition
          "
        >
          Entra
        </button>
      </div>
    </div>
  );
}
