import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calculator, AlertTriangle } from "lucide-react";
import { BLUE_DOOR_PRICE_DISPLAY } from "@/config/blueDoor";

const PROJECT_TIME_OVERRUN = 0.30;
const IN_HOUSE_WORK_WEEK_HOURS = 45;
const IN_HOUSE_PROJECT_ALLOCATION = 0.65;
const IN_HOUSE_PROJECT_HOURS_PER_WEEK = IN_HOUSE_WORK_WEEK_HOURS * IN_HOUSE_PROJECT_ALLOCATION;
const OUTSIDE_RESOURCES = 3;
const OUTSIDE_HOURS_PER_WEEK = 12;
const WEEKS_PER_MONTH = 4.33;
const OUTSIDE_BILLABLE_RATE = 200;

export default function CostCalculatorDialog() {
  const [open, setOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<string>("");
  const [avgSalary, setAvgSalary] = useState<string>("");
  const [licenseFee, setLicenseFee] = useState<string>("");
  const [projectMonths, setProjectMonths] = useState<string>("");
  const [resourceType, setResourceType] = useState<"in-house" | "outside">("in-house");

  const calculations = useMemo(() => {
    const members = parseFloat(teamMembers) || 0;
    const salary = parseFloat(avgSalary) || 0;
    const license = parseFloat(licenseFee) || 0;
    const months = parseFloat(projectMonths) || 0;

    if (members === 0 || months === 0) return null;

    const annualHours = IN_HOUSE_WORK_WEEK_HOURS * 52;
    const hourlyRate = salary / annualHours;
    
    let plannedLaborCost: number;
    let outsideResourceCost = 0;

    if (resourceType === "in-house") {
      const monthlyProjectHours = IN_HOUSE_PROJECT_HOURS_PER_WEEK * WEEKS_PER_MONTH;
      plannedLaborCost = members * hourlyRate * monthlyProjectHours * months;
    } else {
      plannedLaborCost = members * (salary / 12) * months;
      outsideResourceCost = OUTSIDE_RESOURCES * OUTSIDE_HOURS_PER_WEEK * WEEKS_PER_MONTH * OUTSIDE_BILLABLE_RATE * months;
    }
    
    const plannedTechCost = members * license * months;
    const plannedTotal = plannedLaborCost + plannedTechCost + outsideResourceCost;
    const overrunMonths = months * PROJECT_TIME_OVERRUN;
    
    const overrunLaborCost = resourceType === "in-house"
      ? members * hourlyRate * IN_HOUSE_PROJECT_HOURS_PER_WEEK * WEEKS_PER_MONTH * overrunMonths
      : members * (salary / 12) * overrunMonths;
    const overrunTechCost = members * license * overrunMonths;
    const overrunOutsideCost = resourceType === "outside"
      ? OUTSIDE_RESOURCES * OUTSIDE_HOURS_PER_WEEK * WEEKS_PER_MONTH * OUTSIDE_BILLABLE_RATE * overrunMonths
      : 0;
    const overrunTotal = overrunLaborCost + overrunTechCost + overrunOutsideCost;
    const failureCost = plannedTotal * 0.5;

    return {
      plannedTotal,
      overrunTotal,
      actualTotal: plannedTotal + overrunTotal,
      failureCost,
      overrunMonths,
      outsideResourceCost,
    };
  }, [teamMembers, avgSalary, licenseFee, projectMonths, resourceType]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="mt-6 border-raspberry text-raspberry hover:bg-raspberry hover:text-white transition-all"
        >
          <Calculator className="w-4 h-4 mr-2" />
          Calculate Your Clarity Gap
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-navy flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-raspberry" />
            The Cost of the Capability Gap
          </DialogTitle>
          <DialogDescription>
            Enter your project details to estimate the potential cost of pursuing transformation where a capability gap exists.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="teamMembers">Project Team Members</Label>
              <Input
                id="teamMembers"
                type="number"
                placeholder="e.g., 12"
                value={teamMembers}
                onChange={(e) => setTeamMembers(e.target.value)}
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="avgSalary">Avg. Annual Salary ($)</Label>
              <Input
                id="avgSalary"
                type="number"
                placeholder="e.g., 85000"
                value={avgSalary}
                onChange={(e) => setAvgSalary(e.target.value)}
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="licenseFee">Monthly License Fee/User ($)</Label>
              <Input
                id="licenseFee"
                type="number"
                placeholder="e.g., 150"
                value={licenseFee}
                onChange={(e) => setLicenseFee(e.target.value)}
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectMonths">Project Length (months)</Label>
              <Input
                id="projectMonths"
                type="number"
                placeholder="e.g., 12"
                value={projectMonths}
                onChange={(e) => setProjectMonths(e.target.value)}
                min="1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>In-House or Partnering with Outside Resources?</Label>
            <RadioGroup
              value={resourceType}
              onValueChange={(v) => setResourceType(v as "in-house" | "outside")}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="in-house" id="in-house" />
                <Label htmlFor="in-house" className="cursor-pointer text-sm">In-House</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="outside" id="outside" />
                <Label htmlFor="outside" className="cursor-pointer text-sm">Partnering with Outside</Label>
              </div>
            </RadioGroup>
            <p className="text-xs text-muted-foreground">
              {resourceType === "in-house"
                ? "Assumes team dedicates ~65% of their time to the project."
                : "Adds 3 outside resources at ~12 hrs/week each, billed at $200/hr."}
            </p>
          </div>

          <p className="text-xs text-muted-foreground italic">
            * Calculations include a 30% average project time overrun based on industry data.
            {resourceType === "in-house"
              ? " In-house teams are estimated at 65% time allocation to the project."
              : " Outside partner costs assume 3 resources × 12 hours/week × $200/hr billable rate."}
          </p>
        </div>

        {calculations && (
          <div className="space-y-3 border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Planned Investment:</span>
              <span className="font-semibold text-navy">
                {formatCurrency(calculations.plannedTotal)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Typical Overrun Cost (+{calculations.overrunMonths.toFixed(1)} months):
              </span>
              <span className="font-semibold text-gold">
                +{formatCurrency(calculations.overrunTotal)}
              </span>
            </div>

            <div className="h-px bg-border" />

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Realistic Total:</span>
              <span className="font-bold text-strategic text-lg">
                {formatCurrency(calculations.actualTotal)}
              </span>
            </div>

            <div className="bg-raspberry/10 border border-raspberry/20 rounded-lg p-4 mt-4">
              <p className="text-sm text-raspberry font-medium mb-1">
                If this transformation fails or stalls:
              </p>
              <p className="text-2xl font-bold text-raspberry">
                {formatCurrency(calculations.failureCost)} - {formatCurrency(calculations.actualTotal)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Potential wasted investment, not including opportunity cost, leadership credibility, or organizational fatigue.
              </p>
            </div>

            <p className="text-sm text-center text-strategic font-medium pt-2">
              The Blue Door: <span className="font-bold">{BLUE_DOOR_PRICE_DISPLAY}</span> to know before you go.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
