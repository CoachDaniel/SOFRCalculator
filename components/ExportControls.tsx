import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';

interface CalculationResult {
  date: string;
  benchmarkRate: number;
  allInRate: number;
  globalDailyInterest: number;
  positionDailyInterest: number;
  globalCumulativeInterest: number;
  positionCumulativeInterest: number;
  globalPrincipal: number;
  positionPrincipal: number;
  bookValue: number;
  dailyAmortization: number;
  cumulativeAmortization: number;
}

interface ExportControlsProps {
  results: CalculationResult[];
}

export function ExportControls({ results }: ExportControlsProps) {
  const exportToCSV = () => {
    if (results.length === 0) return;

    const headers = [
      'Date',
      'Benchmark Rate (%)',
      'All-In Rate (%)',
      'Global Daily Interest',
      'Position Daily Interest',
      'Global Cumulative Interest',
      'Position Cumulative Interest',
      'Position Book Value',
      'Daily Amortization',
      'Cumulative Amortization',
      'Global Principal',
      'Position Principal'
    ];

    const csvContent = [
      headers.join(','),
      ...results.map(result => [
        result.date,
        result.benchmarkRate.toFixed(4),
        result.allInRate.toFixed(4),
        result.globalDailyInterest.toFixed(2),
        result.positionDailyInterest.toFixed(2),
        result.globalCumulativeInterest.toFixed(2),
        result.positionCumulativeInterest.toFixed(2),
        result.bookValue.toFixed(2),
        result.dailyAmortization.toFixed(2),
        result.cumulativeAmortization.toFixed(2),
        result.globalPrincipal.toFixed(0),
        result.positionPrincipal.toFixed(0)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sofr-loan-calculation-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = () => {
    if (results.length === 0) return;

    // Create a more detailed Excel-compatible CSV with additional formatting
    const headers = [
      'Date',
      'Benchmark Rate (%)',
      'All-In Rate (%)',
      'Global Daily Interest ($)',
      'Position Daily Interest ($)',
      'Global Cumulative Interest ($)',
      'Position Cumulative Interest ($)',
      'Position Book Value ($)',
      'Daily Amortization ($)',
      'Cumulative Amortization ($)',
      'Global Principal ($)',
      'Position Principal ($)'
    ];

    const excelContent = [
      headers.join(','),
      ...results.map(result => [
        result.date,
        result.benchmarkRate.toFixed(4),
        result.allInRate.toFixed(4),
        `"${result.globalDailyInterest.toFixed(2)}"`,
        `"${result.positionDailyInterest.toFixed(2)}"`,
        `"${result.globalCumulativeInterest.toFixed(2)}"`,
        `"${result.positionCumulativeInterest.toFixed(2)}"`,
        `"${result.bookValue.toFixed(2)}"`,
        `"${result.dailyAmortization.toFixed(2)}"`,
        `"${result.cumulativeAmortization.toFixed(2)}"`,
        `"${result.globalPrincipal.toFixed(0)}"`,
        `"${result.positionPrincipal.toFixed(0)}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sofr-loan-calculation-${new Date().toISOString().split('T')[0]}.xlsx`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportSummaryReport = () => {
    if (results.length === 0) return;

    const firstResult = results[0];
    const lastResult = results[results.length - 1];
    const totalDays = results.length;

    const reportContent = `SOFR Loan Calculator - Summary Report
Generated: ${new Date().toLocaleString()}

========================================
LOAN OVERVIEW
========================================
Calculation Period: ${firstResult.date} to ${lastResult.date}
Total Calculation Days: ${totalDays}
Global Principal: $${firstResult.globalPrincipal.toLocaleString()}
Position Principal: $${firstResult.positionPrincipal.toLocaleString()}

========================================
INTEREST SUMMARY
========================================
Total Global Interest: $${lastResult.globalCumulativeInterest.toLocaleString()}
Total Position Interest: $${lastResult.positionCumulativeInterest.toLocaleString()}
Average Daily Global Interest: $${(lastResult.globalCumulativeInterest / totalDays).toFixed(2)}
Average Daily Position Interest: $${(lastResult.positionCumulativeInterest / totalDays).toFixed(2)}

========================================
BOOK VALUE SUMMARY
========================================
Starting Book Value: $${firstResult.bookValue.toLocaleString()}
Ending Book Value: $${lastResult.bookValue.toLocaleString()}
Total Amortization: $${lastResult.cumulativeAmortization.toFixed(2)}
Average Daily Amortization: $${(lastResult.cumulativeAmortization / totalDays).toFixed(2)}

========================================
RATE ANALYSIS
========================================
Average Benchmark Rate: ${(results.reduce((sum, r) => sum + r.benchmarkRate, 0) / results.length).toFixed(4)}%
Average All-In Rate: ${(results.reduce((sum, r) => sum + r.allInRate, 0) / results.length).toFixed(4)}%
Minimum Benchmark Rate: ${Math.min(...results.map(r => r.benchmarkRate)).toFixed(4)}%
Maximum Benchmark Rate: ${Math.max(...results.map(r => r.benchmarkRate)).toFixed(4)}%

========================================
DETAILED DAILY CALCULATIONS
========================================
${results.slice(0, 10).map(result => 
  `${result.date}: Benchmark ${result.benchmarkRate.toFixed(4)}%, All-In ${result.allInRate.toFixed(4)}%, Book Value $${result.bookValue.toLocaleString()}, Daily Interest $${result.positionDailyInterest.toFixed(2)}`
).join('\n')}
${results.length > 10 ? '\n... (showing first 10 days, see CSV export for complete data)' : ''}

Report generated by SOFR Loan Calculator
Siepe Asset Management Platform
`;

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sofr-loan-report-${new Date().toISOString().split('T')[0]}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (results.length === 0) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Download className="h-4 w-4 mr-2" />
        Export
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export ({results.length} rows)
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={exportToCSV} className="cursor-pointer">
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export to CSV
          <span className="text-xs text-muted-foreground ml-auto">Raw data</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToExcel} className="cursor-pointer">
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export to Excel
          <span className="text-xs text-muted-foreground ml-auto">Formatted</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportSummaryReport} className="cursor-pointer">
          <FileText className="h-4 w-4 mr-2" />
          Summary Report
          <span className="text-xs text-muted-foreground ml-auto">TXT</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}