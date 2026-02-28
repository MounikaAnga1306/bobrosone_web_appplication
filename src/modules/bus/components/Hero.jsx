export default function Hero() {
  return (
    <div className="w-full flex justify-center my-10">
      <div
        className="w-full max-w-5xl 
    aspect-[10/1] 
    border border-gray-300 
    rounded-2xl shadow-sm 
    overflow-hidden bg-white"
      >
        <img
          src="/assets/poster.jpeg"
          alt="Advertisement"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
