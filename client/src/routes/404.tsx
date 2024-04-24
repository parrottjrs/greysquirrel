export default function NotFound() {
  return (
    <div>
      <h1 className="ml-4 text-left text-nero text-md font-sans font-medium md:text-2xl">
        Greysquirrel
      </h1>
      <div className="md: mt-56 flex flex-col items-center justify-center">
        <div>
          <h2 className="text-nero font-bold font-sans text-xl md:text-3xl">
            404
          </h2>
          <p className="text-nero font-sans text-base text-2xl mt-8">
            Oops, the page you are looking for does not exist
          </p>
          <p className="text-left text-nero text-sm font-IBM md:text-base mt-8 mb-12">
            You may want to head back to the home page
          </p>
          <a
            aria-label="return-home"
            className="p-3 text-nero font-medium no-underline border border-solid rounded-xl"
            href="#/signIn"
          >
            Go back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
