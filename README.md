# SOFR Loan Calculator

A comprehensive SOFR Loan Projection & Interest Calculator for credit/treasury professionals. This application fetches historical SOFR rates via the New York Fed Markets API and allows users to project future rates using various mathematical models.

## Features

- **Historical SOFR Rate Integration** - Connects to NY Fed Markets API
- **Advanced Rate Projections** - Hold-current and custom curve methods
- **Mathematical Curve Models** - Nelson-Siegel, Nelson-Siegel-Svensson, and Cubic Spline
- **Syndicated Loan Support** - Global loan and position-based calculations
- **Day Count Conventions** - ACT/360, ACT/365F, and 30/360 support
- **Export Capabilities** - CSV/Excel export functionality
- **LRU Caching** - Performance optimization with intelligent caching
- **Responsive Design** - Bootstrap 3.4.1 inspired Siepe portal styling

## System Requirements

- **Node.js**: 24.4.1 (recommended) or >= 18.0.0
- **npm**: >= 8.0.0
- **Operating System**: Windows 10/11, macOS, or Linux
- **Browser**: Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)

## Windows Setup Instructions

### Prerequisites
1. Install Node.js 24.4.1 from [nodejs.org](https://nodejs.org/)
2. Verify installation:
   ```cmd
   node --version
   npm --version
   ```

### Installation
1. Clone or extract the project files
2. Open Command Prompt or PowerShell as Administrator
3. Navigate to the project directory:
   ```cmd
   cd path\to\sofr-loan-calculator
   ```
4. Install dependencies:
   ```cmd
   npm install
   ```

### Development
Start the development server:
```cmd
npm run dev
```
The application will be available at `http://localhost:3000`

### Building for Production
```cmd
npm run build
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run type-check` - Run TypeScript type checking
- `npm run clean` - Clean build artifacts

## Windows-Specific Considerations

### Long Path Support
If you encounter path length issues on Windows, enable long path support:
1. Run Command Prompt as Administrator
2. Execute: `git config --system core.longpaths true`

### PowerShell Execution Policy
If you encounter execution policy errors:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Antivirus Software
Some antivirus software may interfere with npm operations. Consider adding the project folder to your antivirus exclusions.

## Technology Stack

- **Frontend**: React 18.3.1 + TypeScript 5.7.2
- **Build Tool**: Vite 6.0.1
- **Styling**: Tailwind CSS 4.0.0-beta + Custom Bootstrap 3.4.1 theme
- **UI Components**: Radix UI primitives
- **Charts**: Recharts 2.13.3
- **Caching**: LRU Cache 10.4.3
- **Date Handling**: date-fns 4.1.0
- **Icons**: Lucide React 0.400.0
- **Linting**: ESLint 9.15.0 with TypeScript support

## Browser Compatibility

- Chrome 90+ ✅
- Firefox 88+ ✅  
- Safari 14+ ✅
- Edge 90+ ✅
- Internet Explorer ❌ (Not supported)

## Performance Features

- **Intelligent Caching** - LRU cache for API responses and calculations
- **Code Splitting** - Automatic vendor and utility chunk separation
- **Tree Shaking** - Dead code elimination for smaller bundles
- **Lazy Loading** - Components loaded on demand
- **Optimized Dependencies** - Pre-bundled for faster cold starts

## Configuration

The application uses the following configuration files:
- `vite.config.ts` - Build and development server configuration
- `eslint.config.js` - Code linting rules (ESLint 9 flat config)
- `tsconfig.json` - TypeScript compiler options
- `tailwind.config.js` - Tailwind CSS customization (auto-generated)

## Troubleshooting

### Common Windows Issues

**Issue**: `npm install` fails with permission errors
**Solution**: Run Command Prompt as Administrator

**Issue**: Port 3000 already in use
**Solution**: Kill existing processes or use a different port:
```cmd
netstat -ano | findstr :3000
taskkill /PID <process_id> /F
```

**Issue**: TypeScript compilation errors
**Solution**: Clear node_modules and reinstall:
```cmd
rmdir /s node_modules
del package-lock.json
npm install
```

**Issue**: Build failures on Windows
**Solution**: Ensure Windows SDK and Visual Studio Build Tools are installed

## Support

For technical issues or questions:
1. Check the browser console for error messages
2. Verify Node.js and npm versions
3. Ensure all dependencies are properly installed
4. Check Windows firewall and antivirus settings

## License

Private - Siepe Internal Use Only