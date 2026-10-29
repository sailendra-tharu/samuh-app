import ReactDOM from "react-dom/client";

import "@/index.css";

const root = ReactDOM.createRoot(document.getElementById("root")!);

// Vite inlines these at build time. Without them the Supabase client throws on
// import and the page stays blank, so explain what is missing instead.
const missingEnv = [
  !import.meta.env.VITE_SUPABASE_URL && "VITE_SUPABASE_URL",
  !import.meta.env.VITE_SUPABASE_ANON_KEY && "VITE_SUPABASE_ANON_KEY",
].filter(Boolean) as string[];

if (missingEnv.length > 0) {
  root.render(
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-gray-900">App is not configured</h1>
        <p className="mt-2 text-sm text-gray-600">
          These environment variables were missing when the site was built:
        </p>
        <ul className="mt-2 list-disc pl-5 font-mono text-sm text-gray-800">
          {missingEnv.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-gray-600">
          Add them in your hosting provider's environment settings and redeploy.
        </p>
      </div>
    </div>
  );
} else {
  import("@/app").then(({ default: App }) => root.render(<App />));
}
