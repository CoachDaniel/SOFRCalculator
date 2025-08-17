import { useState } from "react";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import {
  RefreshCw,
  CheckCircle,
  TrendingUp,
} from "lucide-react";

interface RateSelectorProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
}

export function RateSelector({
  selectedType,
  onTypeChange,
}: RateSelectorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>(
    "2024-01-15 09:30 EST",
  );
  const [currentRates, setCurrentRates] = useState({
    overnight: 5.25,
    "30-day-avg": 5.28,
    "90-day-avg": 5.31,
    "180-day-avg": 5.35,
  });

  const rateTypes = [
    {
      value: "overnight",
      label: "SOFR Overnight Rate",
      description: "Daily effective rate",
      rate: currentRates.overnight,
    },
    {
      value: "30-day-avg",
      label: "SOFR 30-Day Average",
      description: "Trailing 30-day average",
      rate: currentRates["30-day-avg"],
    },
    {
      value: "90-day-avg",
      label: "SOFR 90-Day Average",
      description: "Trailing 90-day average",
      rate: currentRates["90-day-avg"],
    },
    {
      value: "180-day-avg",
      label: "SOFR 180-Day Average",
      description: "Trailing 180-day average",
      rate: currentRates["180-day-avg"],
    },
  ];

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call to NY Fed
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock slight rate changes
    const mockRates = {
      overnight: 5.25 + (Math.random() - 0.5) * 0.1,
      "30-day-avg": 5.28 + (Math.random() - 0.5) * 0.05,
      "90-day-avg": 5.31 + (Math.random() - 0.5) * 0.03,
      "180-day-avg": 5.35 + (Math.random() - 0.5) * 0.02,
    };

    setCurrentRates(mockRates);
    setLastUpdated(
      new Date().toLocaleString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      }),
    );
    setIsLoading(false);
  };

  const formatPercent = (rate: number) => {
    return `${rate.toFixed(3)}%`;
  };

  const selectedRate = rateTypes.find(
    (r) => r.value === selectedType,
  );

  return (
    <div className="space-y-4">
      {/* API Status */}
      <Card className="border border-success-border bg-success/5">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success-text" />
              <span className="text-sm font-medium text-success-text">
                NY Fed API Connected
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="border-success-border text-success-text hover:bg-success/10"
            >
              {isLoading ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Last updated: {lastUpdated}
          </p>
        </CardContent>
      </Card>

      {/* Rate Type Selection */}
      <div className="space-y-2">
        <Label
          htmlFor="rateType"
          className="text-sm font-bold text-foreground"
        >
          SOFR Rate Type
        </Label>
        <Select
          value={selectedType}
          onValueChange={onTypeChange}
        >
          <SelectTrigger className="form-control">
            <SelectValue placeholder="Select SOFR rate type">
              {selectedRate
                ? selectedRate.label
                : "Select SOFR rate type"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-white border border-border">
            {rateTypes.map((rate) => (
              <SelectItem
                key={rate.value}
                value={rate.value}
                textValue={rate.label}
                className="cursor-pointer"
              >
                <div className="flex items-center justify-between w-full min-w-0">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {rate.label}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {rate.description}
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="ml-2 flex-shrink-0"
                  >
                    {formatPercent(rate.rate)}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedType && (
          <p className="text-xs text-muted-foreground">
            Rate will be used as the benchmark for interest
            calculations
          </p>
        )}
      </div>

      {/* Current Rate Display */}
      {selectedRate && (
        <Card className="border border-primary bg-primary/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Current Rate
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedRate.label}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary text-xs">
                  {formatPercent(selectedRate.rate)}
                </p>
                <div className="flex items-center gap-1 text-xs text-success-text">
                  <TrendingUp className="h-3 w-3" />
                  +0.02% today
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rate Information */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>
          <strong>
            SOFR (Secured Overnight Financing Rate)
          </strong>{" "}
          is a broad measure of the cost of borrowing cash
          overnight collateralized by Treasury securities.
        </p>
        <p>
          Rates are published daily by the Federal Reserve Bank
          of New York and are the recommended replacement for
          LIBOR in USD markets.
        </p>
      </div>
    </div>
  );
}