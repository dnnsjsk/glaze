export const Footer = () => {
  return (
    <div className="mt-auto mx-auto w-full max-w-screen-xl pl-[max(env(safe-area-inset-left),1.5rem)] pr-[max(env(safe-area-inset-right),1.5rem)]">
      <div className=" bg-fd-card w-full p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] rounded-t-xl overflow-hidden">
        <p className="mx-auto text-center">
          MIT License © {new Date().getFullYear()}{" "}
          <a
            href="https://dennn.is"
            target="_blank"
            className="text-fd-primary"
          >
            dennn.is
          </a>
        </p>
      </div>
    </div>
  );
};
