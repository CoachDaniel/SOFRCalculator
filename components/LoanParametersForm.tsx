import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent } from './ui/card';
import { Separator } from './ui/separator';
import { BookOpen, Calculator, DollarSign, Percent, TrendingUp, Users } from 'lucide-react';

export interface LoanParameters {
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

interface LoanParametersFormProps {
  parameters: LoanParameters;
  onChange: (parameters: LoanParameters) => void;
}

export function LoanParametersForm({ parameters, onChange }: LoanParametersFormProps) {
  const handleChange = (field: keyof LoanParameters, value: string | number) => {
    onChange({
      ...parameters,
      [field]: value
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Calculate derived values
  const positionSize = parameters.globalParAmount * (parameters.ownershipPercentage / 100);
  const positionCost = positionSize * (parameters.purchasePrice / 100);
  const premiumDiscount = positionCost - positionSize;
  const isPremium = premiumDiscount > 0;
  const isDiscount = premiumDiscount < 0;

  return (
    <div className="space-y-6">
      {/* Global Loan Structure */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Calculator className="h-4 w-4" />
          Global Loan Structure
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="globalParAmount">Global Par Amount</Label>
            <Input
              id="globalParAmount"
              type="number"
              value={parameters.globalParAmount}
              onChange={(e) => handleChange('globalParAmount', Number(e.target.value))}
              className="text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={parameters.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                className="text-sm"
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={parameters.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
                className="text-sm"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="dayCount">Day Count Convention</Label>
            <Select value={parameters.dayCount} onValueChange={(value) => handleChange('dayCount', value)}>
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACT/360">ACT/360</SelectItem>
                <SelectItem value="ACT/365F">ACT/365F</SelectItem>
                <SelectItem value="30/360">30/360</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      {/* Position Details */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Users className="h-4 w-4" />
          Your Position Details
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="ownershipPercentage">% of Ownership</Label>
            <div className="relative">
              <Input
                id="ownershipPercentage"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={parameters.ownershipPercentage}
                onChange={(e) => handleChange('ownershipPercentage', Number(e.target.value))}
                className="text-sm pr-8"
              />
              <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Position Size: {formatCurrency(positionSize)}
            </p>
          </div>

          <div>
            <Label htmlFor="purchasePrice">Purchase Price</Label>
            <div className="relative">
              <Input
                id="purchasePrice"
                type="number"
                step="0.01"
                min="0"
                value={parameters.purchasePrice}
                onChange={(e) => handleChange('purchasePrice', Number(e.target.value))}
                className="text-sm pr-8"
              />
              <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Position Cost: {formatCurrency(positionCost)}
            </p>
          </div>
        </div>

        {/* Premium/Discount Indicator */}
        {Math.abs(premiumDiscount) > 1 && (
          <Card className={`border ${isPremium ? 'border-warning bg-warning/5' : isDiscount ? 'border-success bg-success/5' : 'border-border'}`}>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2">
                <DollarSign className={`h-4 w-4 ${isPremium ? 'text-warning-text' : 'text-success-text'}`} />
                <span className={`text-sm font-medium ${isPremium ? 'text-warning-text' : 'text-success-text'}`}>
                  {isPremium ? 'Premium Purchase' : 'Discount Purchase'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {isPremium ? 'Paid above par:' : 'Paid below par:'} {formatCurrency(Math.abs(premiumDiscount))}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Separator />

      {/* Book Value Amortization */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <BookOpen className="h-4 w-4" />
          Book Value Amortization Method
        </div>

        <div>
          <Label htmlFor="bookValueAmortization">Amortization Method</Label>
          <Select 
            value={parameters.bookValueAmortization} 
            onValueChange={(value) => handleChange('bookValueAmortization', value)}
          >
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">
                <div className="flex flex-col items-start">
                  <span>No Amortization</span>
                  <span className="text-xs text-muted-foreground">Book value stays at purchase price</span>
                </div>
              </SelectItem>
              <SelectItem value="straight-line">
                <div className="flex flex-col items-start">
                  <span>Straight-Line Amortization</span>
                  <span className="text-xs text-muted-foreground">Equal daily amortization to maturity</span>
                </div>
              </SelectItem>
              <SelectItem value="effective-interest">
                <div className="flex flex-col items-start">
                  <span>Effective Interest Method</span>
                  <span className="text-xs text-muted-foreground">Market-based yield amortization</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Method descriptions */}
          <Card className="mt-3 border-muted bg-muted/5">
            <CardContent className="pt-4 pb-3">
              {parameters.bookValueAmortization === 'none' && (
                <div className="text-sm text-muted-foreground">
                  <p><strong>No Amortization:</strong> The book value remains constant at the purchase price throughout the loan term. Any premium or discount will be recognized only at maturity or sale.</p>
                </div>
              )}
              {parameters.bookValueAmortization === 'straight-line' && (
                <div className="text-sm text-muted-foreground">
                  <p><strong>Straight-Line:</strong> The premium or discount is amortized equally over each day of the loan term. Simple and predictable method commonly used for accounting purposes.</p>
                </div>
              )}
              {parameters.bookValueAmortization === 'effective-interest' && (
                <div className="text-sm text-muted-foreground">
                  <p><strong>Effective Interest:</strong> Amortization follows the loan's effective yield pattern, typically resulting in accelerated amortization early in the loan term. Reflects market-based time value of money.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      {/* Interest Rate Terms */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <TrendingUp className="h-4 w-4" />
          Interest Rate Terms
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="spread">Spread (bps)</Label>
            <Input
              id="spread"
              type="number"
              step="0.01"
              value={parameters.spread}
              onChange={(e) => handleChange('spread', Number(e.target.value))}
              className="text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="floor">Floor (%)</Label>
              <Input
                id="floor"
                type="number"
                step="0.01"
                min="0"
                value={parameters.floor}
                onChange={(e) => handleChange('floor', Number(e.target.value))}
                className="text-sm"
              />
            </div>
            <div>
              <Label htmlFor="cap">Cap (%)</Label>
              <Input
                id="cap"
                type="number"
                step="0.01"
                value={parameters.cap}
                onChange={(e) => handleChange('cap', Number(e.target.value))}
                className="text-sm"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="compoundingType">Compounding Method</Label>
            <Select value={parameters.compoundingType} onValueChange={(value) => handleChange('compoundingType', value)}>
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="simple">Simple Interest</SelectItem>
                <SelectItem value="compounded-in-arrears">Compounded in Arrears</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}