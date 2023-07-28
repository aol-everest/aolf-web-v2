import { orgConfig } from "@org";

export const NoHeader = () => {
  return (
    <header className="header tw-relative tw-z-10 tw-bg-white">
      <div className="header__container !tw-justify-center">
        <div className="logo">
          <img src={`/img/${orgConfig.logo}`} alt="logo" />
        </div>
      </div>
    </header>
  );
};
