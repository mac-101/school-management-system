export default function Dashboard() {
  return (
    <>
      <h1 className="text-xl font-semibold text-slate-800 mb-1">
        Grow and strive with good management tool
      </h1>

      <hr className="border-dashed border-slate-300 my-6" />

      <div className="flex gap-6">
        <div className="bg-white border border-slate-200 rounded-lg px-6 py-4 min-w-[180px]">
          <p className="text-sm text-slate-500 mb-2">
            Due fees (count)
          </p>

          <p className="text-2xl font-semibold text-slate-800">
            —
          </p>
        </div>
      </div>
    </>
  );
}