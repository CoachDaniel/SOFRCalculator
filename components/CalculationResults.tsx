import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Calculator, TrendingUp, Calendar, BookOpen } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

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

interface LoanParameters {
  globalParAmount: number;
  ownershipPercentage: number;
  purchasePrice: number;
  startDate: string;
  endDate: string;
  dayCount: 'ACT/360' | 'ACT/365F' | '30/360';
  spread: number;
  floor: number;
  cap: number;
  compoundingType: 'simple' | 'compounded-in-arrears';
  bookValueAmortization: 'none' | 'straight-line' | 'effective-interest';
}

interface CalculationResultsProps {
  results: CalculationResult[];
  parameters: LoanParameters;
  isCalculating: boolean;
}

export function CalculationResults({ results, parameters, isCalculating }: CalculationResultsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatCurrencyDetailed = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(4)}%`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getAmortizationMethodLabel = (method: string) => {
    switch (method) {
      case 'none': return 'No Amortization';
      case 'straight-line': return 'Straight-Line';
      case 'effective-interest': return 'Effective Interest';
      default: return method;
    }
  };

  if (results.length === 0) {
    return (
      <div className="space-y-6">
        {/* Configuration Summary */}
        <Card className="border-muted bg-muted/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Calculation Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Global Par Amount:</span>
                <p className="font-medium">{formatCurrency(parameters.globalParAmount)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Position Ownership:</span>
                <p className="font-medium">{parameters.ownershipPercentage}%</p>
              </div>
              <div>
                <span className="text-muted-foreground">Purchase Price:</span>
                <p className="font-medium">{parameters.purchasePrice}% of par</p>
              </div>
              <div>
                <span className="text-muted-foreground">Book Value Method:</span>
                <p className="font-medium">{getAmortizationMethodLabel(parameters.bookValueAmortization)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Period:</span>
                <p className="font-medium">{formatDate(parameters.startDate)} - {formatDate(parameters.endDate)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Spread:</span>
                <p className="font-medium">{parameters.spread} bps</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ready to Calculate Message */}
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-medium">Ready to Calculate</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Click the Calculate button above to run interest calculations and book value projections for your syndicated loan position.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isCalculating) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-sm text-muted-foreground">Calculating interest projections and book values...</span>
        </div>
        
        {/* Loading skeleton */}
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex space-x-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const totalGlobalInterest = results[results.length - 1]?.globalCumulativeInterest || 0;
  const totalPositionInterest = results[results.length - 1]?.positionCumulativeInterest || 0;
  const finalBookValue = results[results.length - 1]?.bookValue || 0;
  const totalAmortization = results[results.length - 1]?.cumulativeAmortization || 0;

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-success-border bg-success/5">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success-text" />
              <div className="text-sm font-medium text-success-text">Total Global Interest</div>
            </div>
            <div className="text-xl font-bold text-success-text mt-1">
              {formatCurrency(totalGlobalInterest)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary-border bg-primary/5">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <div className="text-sm font-medium text-primary">Total Position Interest</div>
            </div>
            <div className="text-xl font-bold text-primary mt-1">
              {formatCurrency(totalPositionInterest)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-info-border bg-info/5">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-info-text" />
              <div className="text-sm font-medium text-info-text">Final Book Value</div>
            </div>
            <div className="text-xl font-bold text-info-text mt-1">
              {formatCurrency(finalBookValue)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-warning-border bg-warning/5">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-warning-text" />
              <div className="text-sm font-medium text-warning-text">Total Amortization</div>
            </div>
            <div className="text-xl font-bold text-warning-text mt-1">
              {formatCurrencyDetailed(totalAmortization)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Daily Projections</CardTitle>
              <CardDescription>
                {results.length} calculation periods • {getAmortizationMethodLabel(parameters.bookValueAmortization)} method
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="text-xs">
                {parameters.dayCount} Day Count
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {parameters.spread} bps Spread
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow className="border-b">
                  <TableHead className="text-xs font-medium">Date</TableHead>
                  <TableHead className="text-xs font-medium text-right">Benchmark Rate</TableHead>
                  <TableHead className="text-xs font-medium text-right">All-In Rate</TableHead>
                  <TableHead className="text-xs font-medium text-right">Global Daily Interest</TableHead>
                  <TableHead className="text-xs font-medium text-right">Position Daily Interest</TableHead>
                  <TableHead className="text-xs font-medium text-right">Position Book Value</TableHead>
                  <TableHead className="text-xs font-medium text-right">Daily Amortization</TableHead>
                  <TableHead className="text-xs font-medium text-right">Global Cumulative</TableHead>
                  <TableHead className="text-xs font-medium text-right">Position Cumulative</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result, index) => (
                  <TableRow key={index} className="hover:bg-muted/50">
                    <TableCell className="text-xs font-medium">
                      {formatDate(result.date)}
                    </TableCell>
                    <TableCell className="text-xs text-right font-mono">
                      {formatPercent(result.benchmarkRate)}
                    </TableCell>
                    <TableCell className="text-xs text-right font-mono">
                      {formatPercent(result.allInRate)}
                    </TableCell>
                    <TableCell className="text-xs text-right font-mono">
                      {formatCurrencyDetailed(result.globalDailyInterest)}
                    </TableCell>
                    <TableCell className="text-xs text-right font-mono">
                      {formatCurrencyDetailed(result.positionDailyInterest)}
                    </TableCell>
                    <TableCell className="text-xs text-right font-mono font-medium text-info-text">
                      {formatCurrency(result.bookValue)}
                    </TableCell>
                    <TableCell className={`text-xs text-right font-mono ${result.dailyAmortization !== 0 ? 'text-warning-text' : 'text-muted-foreground'}`}>
                      {result.dailyAmortization !== 0 ? formatCurrencyDetailed(result.dailyAmortization) : '-'}
                    </TableCell>
                    <TableCell className="text-xs text-right font-mono">
                      {formatCurrency(result.globalCumulativeInterest)}
                    </TableCell>
                    <TableCell className="text-xs text-right font-mono">
                      {formatCurrency(result.positionCumulativeInterest)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}