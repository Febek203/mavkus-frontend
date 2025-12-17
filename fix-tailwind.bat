@echo off
echo 🚀 Fixing Tailwind CSS configuration...

echo 📦 Removing Tailwind v4...
npm uninstall tailwindcss

echo 📦 Installing Tailwind v3...
npm install -D tailwindcss@^3.4.3

echo 📦 Installing correct dependencies...
npm install -D autoprefixer@^10.4.19 postcss@^8.4.38 @craco/craco@^7.1.0

echo 📦 Downgrading React to v18...
npm install react@^18.2.0 react-dom@^18.2.0

echo 📦 Updating Firebase...
npm install firebase@^10.12.0

echo 📦 Recreating config files...

rem Create tailwind.config.js
echo /** @type {import('tailwindcss').Config} */ > tailwind.config.js
echo module.exports = { >> tailwind.config.js
echo   content: [ >> tailwind.config.js
echo     "./src/**/*.{js,jsx,ts,tsx}", >> tailwind.config.js
echo     "./public/index.html" >> tailwind.config.js
echo   ], >> tailwind.config.js
echo   theme: { >> tailwind.config.js
echo     extend: {}, >> tailwind.config.js
echo   }, >> tailwind.config.js
echo   plugins: [], >> tailwind.config.js
echo } >> tailwind.config.js

rem Create postcss.config.js
echo module.exports = { > postcss.config.js
echo   plugins: { >> postcss.config.js
echo     tailwindcss: {}, >> postcss.config.js
echo     autoprefixer: {}, >> postcss.config.js
echo   }, >> postcss.config.js
echo } >> postcss.config.js

rem Create craco.config.js
echo module.exports = { > craco.config.js
echo   style: { >> craco.config.js
echo     postcss: { >> craco.config.js
echo       plugins: [ >> craco.config.js
echo         require('tailwindcss'), >> craco.config.js
echo         require('autoprefixer'), >> craco.config.js
echo       ], >> craco.config.js
echo     }, >> craco.config.js
echo   }, >> craco.config.js
echo } >> craco.config.js

rem Fix index.css
echo @tailwind base; > src/index.css
echo @tailwind components; >> src/index.css
echo @tailwind utilities; >> src/index.css
echo. >> src/index.css
echo body { >> src/index.css
echo   margin: 0; >> src/index.css
echo   font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', >> src/index.css
echo     'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', >> src/index.css
echo     sans-serif; >> src/index.css
echo   -webkit-font-smoothing: antialiased; >> src/index.css
echo   -moz-osx-font-smoothing: grayscale; >> src/index.css
echo } >> src/index.css
echo. >> src/index.css
echo code { >> src/index.css
echo   font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New', >> src/index.css
echo     monospace; >> src/index.css
echo } >> src/index.css

echo ✅ All fixed! Now run: npm start