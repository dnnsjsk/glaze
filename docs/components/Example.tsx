const Example = ({ children }) => {
  const isString = typeof children === "string";
  const content = isString ? { __html: children } : null;

  return (
    <div className="-mx-6">
      <div className="flex h-max w-full items-center justify-center overflow-hidden bg-neutral-900 p-12 md:rounded-xl">
        {content ? <div dangerouslySetInnerHTML={content} /> : children}
      </div>
    </div>
  );
};

export default Example;
