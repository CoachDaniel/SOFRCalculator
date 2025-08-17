import { useState } from 'react';
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Plus, X, Calendar, TrendingUp, Lock, LineChart, BarChart3, Activity } from "lucide-react";
import { RateProjection } from "../App";

interface FutureRateProjectionProps {
  projection: RateProjection;
  onChange: (projection: RateProjection) => void;
  currentApiRate?: number;
}

export function FutureRateProjection({ projection, onChange, currentApiRate = 5.25 }: FutureRateProjectionProps) {
  const [newSegment, setNewSegment] = useState({
    startDate: '',
    endDate: '',
    rate: 5.25
  });

  const [newKnot, setNewKnot] = useState({
    maturity: 1.0,
    rate: 5.25
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateProjection = (field: keyof RateProjection, value: any) => {
    onChange({
      ...projection,
      [field]: value
    });
  };

  const addCustomSegment = () => {
    if (!newSegment.startDate || !newSegment.endDate) return;

    const segments = projection.customSegments || [];
    const updatedSegments = [...segments, { ...newSegment }];
    
    // Sort segments by start date
    updatedSegments.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    onChange({
      ...projection,
      customSegments: updatedSegments
    });

    // Reset form
    setNewSegment({
      startDate: '',
      endDate: '',
      rate: 5.25
    });
  };

  const removeSegment = (index: number) => {
    const segments = projection.customSegments || [];
    const updatedSegments = segments.filter((_, i) => i !== index);
    
    onChange({
      ...projection,
      customSegments: updatedSegments
    });
  };

  const addSplineKnot = () => {
    const knots = projection.splineParams?.knots || [];
    const updatedKnots = [...knots, { ...newKnot }];
    
    // Sort knots by maturity
    updatedKnots.sort((a, b) => a.maturity - b.maturity);

    onChange({
      ...projection,
      splineParams: {
        knots: updatedKnots
      }
    });

    // Reset form
    setNewKnot({
      maturity: 1.0,
      rate: 5.25
    });
  };

  const removeKnot = (index: number) => {
    const knots = projection.splineParams?.knots || [];
    const updatedKnots = knots.filter((_, i) => i !== index);
    
    onChange({
      ...projection,
      splineParams: {
        knots: updatedKnots
      }
    });
  };

  const formatPercent = (rate: number) => {
    return `${rate.toFixed(3)}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const initializeCurveModel = (model: string) => {
    const baseParams = {
      curveModel: model as 'manual' | 'nelson-siegel' | 'nelson-siegel-svensson' | 'cubic-spline'
    };

    switch (model) {
      case 'nelson-siegel':
        return {
          ...baseParams,
          nelsonSiegelParams: {
            beta0: currentApiRate, // Start with current rate as long-term level
            beta1: -0.5,           // Short-term component
            beta2: 0.2,            // Medium-term component
            tau: 2.0              // Decay parameter
          }
        };
      
      case 'nelson-siegel-svensson':
        return {
          ...baseParams,
          nssParams: {
            beta0: currentApiRate, // Start with current rate as long-term level
            beta1: -0.5,           // Short-term component
            beta2: 0.2,            // Medium-term component 1
            beta3: 0.1,            // Medium-term component 2
            tau1: 1.0,             // Decay parameter 1
            tau2: 5.0              // Decay parameter 2
          }
        };
      
      case 'cubic-spline':
        return {
          ...baseParams,
          splineParams: {
            knots: [
              { maturity: 0.25, rate: currentApiRate },    // 3 months
              { maturity: 1.0, rate: currentApiRate + 0.2 }, // 1 year
              { maturity: 5.0, rate: currentApiRate + 0.5 }, // 5 years
              { maturity: 10.0, rate: currentApiRate + 0.3 } // 10 years
            ]
          }
        };
      
      default:
        return baseParams;
    }
  };

  const handleCurveModelChange = (model: string) => {
    const newParams = initializeCurveModel(model);
    onChange({
      ...projection,
      ...newParams
    });
  };

  return (
    <div className="space-y-6">
      {/* Projection Method Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-bold text-foreground">Projection Method</Label>
        
        <div className="space-y-3">
          <Card 
            className={`border cursor-pointer transition-colors ${
              projection.mode === 'hold-current' 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => updateProjection('mode', 'hold-current')}
          >
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    projection.mode === 'hold-current' 
                      ? 'border-primary bg-primary' 
                      : 'border-muted-foreground'
                  }`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">Hold Current Rate</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Use the current rate for the entire projection period
                    </p>
                  </div>
                </div>
                {projection.mode === 'hold-current' && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    Selected
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`border cursor-pointer transition-colors ${
              projection.mode === 'custom-curve' 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => updateProjection('mode', 'custom-curve')}
          >
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    projection.mode === 'custom-curve' 
                      ? 'border-primary bg-primary' 
                      : 'border-muted-foreground'
                  }`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">Custom Rate Curve</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Define rate projections using mathematical models or manual segments
                    </p>
                  </div>
                </div>
                {projection.mode === 'custom-curve' && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    Selected
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator className="bg-border" />

      {/* Hold Current Rate Configuration */}
      {projection.mode === 'hold-current' && (
        <div className="space-y-3">
          <Label className="text-sm font-bold text-foreground">Current Rate to Hold</Label>
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              min="0"
              step="0.001"
              value={projection.currentRate || currentApiRate}
              onChange={(e) => updateProjection('currentRate', Number(e.target.value))}
              className="form-control"
              placeholder="5.250"
            />
            <div className="flex items-center px-3 py-2 bg-muted rounded text-sm text-muted-foreground">
              Rate: {formatPercent(projection.currentRate || currentApiRate)}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            This rate will be used for all days in your projection period. API Rate: {formatPercent(currentApiRate)}
          </p>
        </div>
      )}

      {/* Custom Curve Configuration */}
      {projection.mode === 'custom-curve' && (
        <div className="space-y-4">
          {/* Curve Model Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-bold text-foreground">Curve Model</Label>
            <Select 
              value={projection.curveModel || 'manual'} 
              onValueChange={handleCurveModelChange}
            >
              <SelectTrigger className="form-control">
                <SelectValue placeholder="Select curve model" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-border">
                <SelectItem value="manual">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Manual Rate Segments
                  </div>
                </SelectItem>
                <SelectItem value="nelson-siegel">
                  <div className="flex items-center gap-2">
                    <LineChart className="h-4 w-4" />
                    Nelson-Siegel Model
                  </div>
                </SelectItem>
                <SelectItem value="nelson-siegel-svensson">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Nelson-Siegel-Svensson Model
                  </div>
                </SelectItem>
                <SelectItem value="cubic-spline">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Cubic Spline Interpolation
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose a mathematical model or define manual segments for rate projections
            </p>
          </div>

          <Separator className="bg-border" />

          {/* Manual Segments */}
          {(!projection.curveModel || projection.curveModel === 'manual') && (
            <div className="space-y-4">
              <Label className="text-sm font-bold text-foreground">Rate Segments</Label>
              
              {/* Existing Segments */}
              {projection.customSegments && projection.customSegments.length > 0 && (
                <div className="space-y-2">
                  {projection.customSegments.map((segment, index) => (
                    <Card key={index} className="border border-border">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="text-sm font-medium">
                              {formatDate(segment.startDate)} - {formatDate(segment.endDate)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Segment {index + 1}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-primary/10 text-primary">
                              {formatPercent(segment.rate)}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeSegment(index)}
                              className="border-danger/50 text-danger hover:bg-danger/10"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Add New Segment */}
              <Card className="border border-dashed border-primary/50 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Rate Segment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="startDate" className="text-xs font-medium text-muted-foreground">
                        Start Date
                      </Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={newSegment.startDate}
                        onChange={(e) => setNewSegment({ ...newSegment, startDate: e.target.value })}
                        className="form-control"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="endDate" className="text-xs font-medium text-muted-foreground">
                        End Date
                      </Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={newSegment.endDate}
                        onChange={(e) => setNewSegment({ ...newSegment, endDate: e.target.value })}
                        className="form-control"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="segmentRate" className="text-xs font-medium text-muted-foreground">
                      Rate (%)
                    </Label>
                    <Input
                      id="segmentRate"
                      type="number"
                      min="0"
                      step="0.001"
                      value={newSegment.rate}
                      onChange={(e) => setNewSegment({ ...newSegment, rate: Number(e.target.value) })}
                      className="form-control"
                      placeholder="5.250"
                    />
                  </div>

                  <Button
                    onClick={addCustomSegment}
                    disabled={!newSegment.startDate || !newSegment.endDate}
                    className="w-full bg-primary hover:bg-primary/90 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Segment
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Nelson-Siegel Parameters */}
          {projection.curveModel === 'nelson-siegel' && (
            <div className="space-y-4">
              <Label className="text-sm font-bold text-foreground">Nelson-Siegel Parameters</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-muted-foreground">β₀ (Long-term Level)</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={projection.nelsonSiegelParams?.beta0 || currentApiRate}
                    onChange={(e) => updateProjection('nelsonSiegelParams', {
                      ...projection.nelsonSiegelParams,
                      beta0: Number(e.target.value)
                    })}
                    className="form-control"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-muted-foreground">β₁ (Short-term Component)</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={projection.nelsonSiegelParams?.beta1 || -0.5}
                    onChange={(e) => updateProjection('nelsonSiegelParams', {
                      ...projection.nelsonSiegelParams,
                      beta1: Number(e.target.value)
                    })}
                    className="form-control"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-muted-foreground">β₂ (Medium-term Component)</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={projection.nelsonSiegelParams?.beta2 || 0.2}
                    onChange={(e) => updateProjection('nelsonSiegelParams', {
                      ...projection.nelsonSiegelParams,
                      beta2: Number(e.target.value)
                    })}
                    className="form-control"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-muted-foreground">τ (Decay Parameter)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={projection.nelsonSiegelParams?.tau || 2.0}
                    onChange={(e) => updateProjection('nelsonSiegelParams', {
                      ...projection.nelsonSiegelParams,
                      tau: Number(e.target.value)
                    })}
                    className="form-control"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                The Nelson-Siegel model uses exponential decay functions to model the yield curve shape
              </p>
            </div>
          )}

          {/* Nelson-Siegel-Svensson Parameters */}
          {projection.curveModel === 'nelson-siegel-svensson' && (
            <div className="space-y-4">
              <Label className="text-sm font-bold text-foreground">Nelson-Siegel-Svensson Parameters</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-muted-foreground">β₀ (Long-term Level)</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={projection.nssParams?.beta0 || currentApiRate}
                    onChange={(e) => updateProjection('nssParams', {
                      ...projection.nssParams,
                      beta0: Number(e.target.value)
                    })}
                    className="form-control"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-muted-foreground">β₁ (Short-term Component)</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={projection.nssParams?.beta1 || -0.5}
                    onChange={(e) => updateProjection('nssParams', {
                      ...projection.nssParams,
                      beta1: Number(e.target.value)
                    })}
                    className="form-control"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-muted-foreground">β₂ (Medium-term Component 1)</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={projection.nssParams?.beta2 || 0.2}
                    onChange={(e) => updateProjection('nssParams', {
                      ...projection.nssParams,
                      beta2: Number(e.target.value)
                    })}
                    className="form-control"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-muted-foreground">β₃ (Medium-term Component 2)</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={projection.nssParams?.beta3 || 0.1}
                    onChange={(e) => updateProjection('nssParams', {
                      ...projection.nssParams,
                      beta3: Number(e.target.value)
                    })}
                    className="form-control"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-muted-foreground">τ₁ (Decay Parameter 1)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={projection.nssParams?.tau1 || 1.0}
                    onChange={(e) => updateProjection('nssParams', {
                      ...projection.nssParams,
                      tau1: Number(e.target.value)
                    })}
                    className="form-control"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-muted-foreground">τ₂ (Decay Parameter 2)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={projection.nssParams?.tau2 || 5.0}
                    onChange={(e) => updateProjection('nssParams', {
                      ...projection.nssParams,
                      tau2: Number(e.target.value)
                    })}
                    className="form-control"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                The NSS model extends Nelson-Siegel with an additional hump for more flexible curve fitting
              </p>
            </div>
          )}

          {/* Cubic Spline Parameters */}
          {projection.curveModel === 'cubic-spline' && (
            <div className="space-y-4">
              <Label className="text-sm font-bold text-foreground">Spline Control Points</Label>
              
              {/* Existing Knots */}
              {projection.splineParams?.knots && projection.splineParams.knots.length > 0 && (
                <div className="space-y-2">
                  {projection.splineParams.knots.map((knot, index) => (
                    <Card key={index} className="border border-border">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="text-sm font-medium">
                              {knot.maturity} year{knot.maturity !== 1 ? 's' : ''}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Control Point {index + 1}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-primary/10 text-primary">
                              {formatPercent(knot.rate)}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeKnot(index)}
                              className="border-danger/50 text-danger hover:bg-danger/10"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Add New Knot */}
              <Card className="border border-dashed border-primary/50 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Control Point
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-muted-foreground">
                        Maturity (Years)
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.25"
                        value={newKnot.maturity}
                        onChange={(e) => setNewKnot({ ...newKnot, maturity: Number(e.target.value) })}
                        className="form-control"
                        placeholder="1.0"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-muted-foreground">
                        Rate (%)
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.001"
                        value={newKnot.rate}
                        onChange={(e) => setNewKnot({ ...newKnot, rate: Number(e.target.value) })}
                        className="form-control"
                        placeholder="5.250"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={addSplineKnot}
                    className="w-full bg-primary hover:bg-primary/90 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Control Point
                  </Button>
                </CardContent>
              </Card>

              <p className="text-xs text-muted-foreground">
                Cubic spline interpolation creates smooth curves between control points at different maturities
              </p>
            </div>
          )}

          {/* Model Information */}
          {(!projection.customSegments || projection.customSegments.length === 0) && 
           (!projection.curveModel || projection.curveModel === 'manual') && (
            <div className="text-center py-6 text-muted-foreground">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No rate segments defined</p>
              <p className="text-xs">Add segments or choose a mathematical model to create your rate curve</p>
            </div>
          )}
        </div>
      )}

      {/* Projection Summary */}
      <Card className="border border-info/20 bg-info/5">
        <CardContent className="pt-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-info-text" />
              <span className="text-sm font-medium text-info-text">Projection Summary</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {projection.mode === 'hold-current' ? (
                <p>
                  Using a constant rate of <strong>{formatPercent(projection.currentRate || currentApiRate)}</strong> for all periods
                </p>
              ) : (
                <div>
                  {projection.curveModel === 'manual' && (
                    <p>
                      Using <strong>{projection.customSegments?.length || 0}</strong> custom rate segments
                      {projection.customSegments && projection.customSegments.length > 0 && (
                        <>
                          {' '}ranging from <strong>{formatPercent(Math.min(...projection.customSegments.map(s => s.rate)))}</strong>
                          {' '}to <strong>{formatPercent(Math.max(...projection.customSegments.map(s => s.rate)))}</strong>
                        </>
                      )}
                    </p>
                  )}
                  {projection.curveModel === 'nelson-siegel' && (
                    <p>
                      Using <strong>Nelson-Siegel</strong> model with long-term level of{' '}
                      <strong>{formatPercent(projection.nelsonSiegelParams?.beta0 || currentApiRate)}</strong>
                    </p>
                  )}
                  {projection.curveModel === 'nelson-siegel-svensson' && (
                    <p>
                      Using <strong>Nelson-Siegel-Svensson</strong> model with long-term level of{' '}
                      <strong>{formatPercent(projection.nssParams?.beta0 || currentApiRate)}</strong>
                    </p>
                  )}
                  {projection.curveModel === 'cubic-spline' && (
                    <p>
                      Using <strong>Cubic Spline</strong> interpolation with{' '}
                      <strong>{projection.splineParams?.knots?.length || 0}</strong> control points
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}