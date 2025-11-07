<?php

namespace App\Services;

use App\Models\BillingAccount;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\StatementOfAccount;
use App\Models\AppPlan;
use App\Models\Discount;
use App\Models\Installment;
use App\Models\InstallmentSchedule;
use App\Models\AdvancedPayment;
use App\Models\MassRebate;
use App\Models\Barangay;
use App\Models\BillingConfig;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class EnhancedBillingGenerationService
{
    protected const VAT_RATE = 0.12;
    protected const DAYS_IN_MONTH = 30;
    protected const DAYS_UNTIL_DUE = 7;
    protected const DAYS_UNTIL_DC_NOTICE = 4;
    protected const END_OF_MONTH_BILLING = 0;

    public function generateSOAForBillingDay(int $billingDay, Carbon $generationDate, int $userId): array
    {
        $results = [
            'success' => 0,
            'failed' => 0,
            'errors' => [],
            'statements' => []
        ];

        try {
            $accounts = $this->getActiveAccountsForBillingDay($billingDay, $generationDate);

            foreach ($accounts as $account) {
                try {
                    $statement = $this->createEnhancedStatement($account, $generationDate, $userId);
                    $results['statements'][] = $statement;
                    $results['success']++;
                } catch (\Exception $e) {
                    $results['failed']++;
                    $results['errors'][] = [
                        'account_id' => $account->id,
                        'account_no' => $account->account_no,
                        'error' => $e->getMessage()
                    ];
                    Log::error("Failed to generate SOA for account {$account->account_no}: " . $e->getMessage());
                }
            }

            return $results;
        } catch (\Exception $e) {
            Log::error("Error in generateSOAForBillingDay: " . $e->getMessage());
            throw $e;
        }
    }

    public function generateInvoicesForBillingDay(int $billingDay, Carbon $generationDate, int $userId): array
    {
        $results = [
            'success' => 0,
            'failed' => 0,
            'errors' => [],
            'invoices' => []
        ];

        try {
            $accounts = $this->getActiveAccountsForBillingDay($billingDay, $generationDate);

            foreach ($accounts as $account) {
                try {
                    $invoice = $this->createEnhancedInvoice($account, $generationDate, $userId);
                    $results['invoices'][] = $invoice;
                    $results['success']++;
                } catch (\Exception $e) {
                    $results['failed']++;
                    $results['errors'][] = [
                        'account_id' => $account->id,
                        'account_no' => $account->account_no,
                        'error' => $e->getMessage()
                    ];
                    Log::error("Failed to generate invoice for account {$account->account_no}: " . $e->getMessage());
                }
            }

            return $results;
        } catch (\Exception $e) {
            Log::error("Error in generateInvoicesForBillingDay: " . $e->getMessage());
            throw $e;
        }
    }

    protected function getActiveAccountsForBillingDay(int $billingDay, Carbon $generationDate)
    {
        $targetDay = $this->adjustBillingDayForMonth($billingDay, $generationDate);

        $query = BillingAccount::with(['customer'])
            ->where('billing_status_id', 2)
            ->whereNotNull('date_installed');

        if ($billingDay === self::END_OF_MONTH_BILLING) {
            $query->where('billing_day', self::END_OF_MONTH_BILLING);
        } else {
            $query->where('billing_day', $targetDay);
        }

        return $query->get();
    }

    protected function getAdvanceGenerationDay(): int
    {
        $billingConfig = BillingConfig::first();
        
        if (!$billingConfig || $billingConfig->advance_generation_day === null) {
            Log::info('No advance_generation_day configured, using default 0');
            return 0;
        }
        
        return $billingConfig->advance_generation_day;
    }

    protected function calculateTargetBillingDays(Carbon $generationDate): array
    {
        $advanceGenerationDay = $this->getAdvanceGenerationDay();
        $currentDay = $generationDate->day;
        $targetBillingDay = $currentDay + $advanceGenerationDay;
        
        $billingDays = [];
        
        if ($generationDate->isLastOfMonth()) {
            $billingDays[] = self::END_OF_MONTH_BILLING;
            
            $lastDayOfMonth = $generationDate->day;
            $targetDay = $lastDayOfMonth + $advanceGenerationDay;
            
            if ($targetDay <= 31) {
                $billingDays[] = $targetDay;
            }
        } else {
            if ($targetBillingDay <= 31) {
                $billingDays[] = $targetBillingDay;
            }
            
            $lastDayOfMonth = $generationDate->copy()->endOfMonth()->day;
            if ($targetBillingDay > $lastDayOfMonth) {
                $billingDays[] = self::END_OF_MONTH_BILLING;
            }
        }
        
        Log::info('Calculated target billing days', [
            'generation_date' => $generationDate->format('Y-m-d'),
            'current_day' => $currentDay,
            'advance_generation_day' => $advanceGenerationDay,
            'target_billing_day' => $targetBillingDay,
            'billing_days_to_process' => $billingDays
        ]);
        
        return $billingDays;
    }

    protected function adjustBillingDayForMonth(int $billingDay, Carbon $date): int
    {
        if ($billingDay === self::END_OF_MONTH_BILLING) {
            return self::END_OF_MONTH_BILLING;
        }

        if ($date->format('M') === 'Feb') {
            if ($billingDay === 29) {
                return 1;
            } elseif ($billingDay === 30) {
                return 2;
            } elseif ($billingDay === 31) {
                return 3;
            }
        }
        return $billingDay;
    }

    public function createEnhancedStatement(BillingAccount $account, Carbon $statementDate, int $userId): StatementOfAccount
    {
        DB::beginTransaction();

        try {
            $customer = $account->customer;
            if (!$customer) {
                throw new \Exception("Customer not found for account {$account->account_no}");
            }

            $desiredPlan = $customer->desired_plan;
            if (!$desiredPlan) {
                throw new \Exception("No desired_plan found for customer {$customer->full_name}");
            }

            $planName = $this->extractPlanName($desiredPlan);
            
            Log::info('Looking up plan', [
                'plan_name_extracted' => $planName,
                'original_desired_plan' => $desiredPlan
            ]);
            
            $plan = AppPlan::where('plan_name', $planName)->first();
                
            if (!$plan) {
                $allPlans = AppPlan::select('id', 'plan_name', 'price')->get();
                Log::error('Plan not found', [
                    'searching_for' => $planName,
                    'available_plans' => $allPlans->toArray()
                ]);
                throw new \Exception("Plan '{$planName}' not found in plan_list table (extracted from '{$desiredPlan}'). Available plans: " . $allPlans->pluck('plan_name')->implode(', '));
            }

            if (!$plan->price || $plan->price <= 0) {
                throw new \Exception("Plan '{$planName}' has invalid price: " . ($plan->price ?? 'NULL'));
            }

            $adjustedDate = $this->calculateAdjustedBillingDate($account, $statementDate);
            $dueDate = $adjustedDate->copy()->addDays(self::DAYS_UNTIL_DUE);

            $prorateAmount = $this->calculateProrateAmount($account, $plan->price, $adjustedDate);
            $monthlyFeeGross = $prorateAmount / (1 + self::VAT_RATE);
            $vat = $monthlyFeeGross * self::VAT_RATE;
            $monthlyServiceFee = $prorateAmount - $vat;

            $invoiceId = $this->generateInvoiceId($statementDate);
            
            $charges = $this->calculateChargesAndDeductions(
                $account, 
                $statementDate, 
                $userId, 
                $invoiceId,
                $plan->price
            );
            
            $othersAndBasicCharges = $charges['staggered_fees'] + 
                                     $charges['staggered_install_fees'] + 
                                     $charges['service_fees'] - 
                                     $charges['total_deductions'];

            $amountDue = $monthlyServiceFee + $vat + $othersAndBasicCharges;
            $totalAmountDue = $account->account_balance + $amountDue;

            $statement = StatementOfAccount::create([
                'account_id' => $account->id,
                'statement_date' => $statementDate,
                'balance_from_previous_bill' => round($account->account_balance, 2),
                'payment_received_previous' => round($charges['payment_received_previous'], 2),
                'remaining_balance_previous' => round($account->account_balance, 2),
                'monthly_service_fee' => round($monthlyServiceFee, 2),
                'others_and_basic_charges' => round($othersAndBasicCharges, 2),
                'vat' => round($vat, 2),
                'due_date' => $dueDate,
                'amount_due' => round($amountDue, 2),
                'total_amount_due' => round($totalAmountDue, 2),
                'print_link' => null,
                'created_by' => (string) $userId,
                'updated_by' => (string) $userId
            ]);

            DB::commit();
            return $statement;

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function createEnhancedInvoice(BillingAccount $account, Carbon $invoiceDate, int $userId): Invoice
    {
        DB::beginTransaction();

        try {
            $customer = $account->customer;
            if (!$customer) {
                throw new \Exception("Customer not found for account {$account->account_no}");
            }

            $desiredPlan = $customer->desired_plan;
            if (!$desiredPlan) {
                throw new \Exception("No desired_plan found for customer {$customer->full_name}");
            }

            $planName = $this->extractPlanName($desiredPlan);
            
            $plan = AppPlan::where('plan_name', $planName)->first();
            if (!$plan) {
                throw new \Exception("Plan '{$planName}' not found in plan_list table (extracted from '{$desiredPlan}')");
            }

            if (!$plan->price || $plan->price <= 0) {
                throw new \Exception("Plan '{$planName}' has invalid price: " . ($plan->price ?? 'NULL'));
            }

            $adjustedDate = $this->calculateAdjustedBillingDate($account, $invoiceDate);
            $dueDate = $adjustedDate->copy()->addDays(self::DAYS_UNTIL_DUE);

            $invoiceId = $this->generateInvoiceId($invoiceDate);
            
            $prorateAmount = $this->calculateProrateAmount($account, $plan->price, $adjustedDate);
            $charges = $this->calculateChargesAndDeductions(
                $account, 
                $invoiceDate, 
                $userId, 
                $invoiceId,
                $plan->price
            );
            
            $othersBasicCharges = $charges['staggered_fees'] + 
                                  $charges['staggered_install_fees'] + 
                                  $charges['service_fees'] - 
                                  $charges['total_deductions'];

            $totalAmount = $prorateAmount + $othersBasicCharges;
            
            if ($account->account_balance < 0) {
                $totalAmount += $account->account_balance;
            }

            $invoice = Invoice::create([
                'account_id' => $account->id,
                'invoice_date' => $invoiceDate,
                'invoice_balance' => round($prorateAmount, 2),
                'others_and_basic_charges' => round($othersBasicCharges, 2),
                'total_amount' => round($totalAmount, 2),
                'received_payment' => 0.00,
                'due_date' => $dueDate,
                'status' => $totalAmount <= 0 ? 'Paid' : 'Unpaid',
                'payment_portal_log_ref' => null,
                'transaction_id' => null,
                'created_by' => (string) $userId,
                'updated_by' => (string) $userId
            ]);

            $newBalance = $account->account_balance > 0 
                ? $totalAmount + $account->account_balance 
                : $totalAmount;

            $account->update([
                'account_balance' => round($newBalance, 2),
                'balance_update_date' => $invoiceDate
            ]);

            DB::commit();
            return $invoice;

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    protected function generateInvoiceId(Carbon $date): string
    {
        $year = $date->format('y');
        $month = $date->format('m');
        $day = $date->format('d');
        $hour = $date->format('H');
        $randomId = '0000';
        
        return $year . $month . $day . $hour . $randomId;
    }

    protected function calculateAdjustedBillingDate(BillingAccount $account, Carbon $baseDate): Carbon
    {
        if ($account->billing_day === self::END_OF_MONTH_BILLING) {
            return $baseDate->copy()->endOfMonth();
        }

        if ($account->billing_day != 30) {
            $daysRemaining = 30 - $account->billing_day;
            return $baseDate->copy()->addDays($daysRemaining);
        }
        
        return $baseDate->copy();
    }

    protected function calculateProrateAmount(BillingAccount $account, float $monthlyFee, Carbon $currentDate): float
    {
        if ($account->balance_update_date) {
            return $monthlyFee;
        }

        if (!$account->date_installed) {
            return $monthlyFee;
        }

        $dateInstalled = Carbon::parse($account->date_installed);
        $daysToCalculate = $this->getDaysBetweenDatesIncludingDueDate($dateInstalled, $currentDate);
        $dailyRate = $monthlyFee / self::DAYS_IN_MONTH;
        
        return round($dailyRate * $daysToCalculate, 2);
    }

    protected function calculateChargesAndDeductions(
        BillingAccount $account, 
        Carbon $date, 
        int $userId, 
        string $invoiceId,
        float $monthlyFee
    ): array {
        $staggeredFees = $this->calculateStaggeredFees($account, $userId, $invoiceId);
        $staggeredInstallFees = $this->calculateStaggeredInstallFees($account, $userId, $invoiceId);
        $discounts = $this->calculateDiscounts($account, $userId, $invoiceId);
        $advancedPayments = $this->calculateAdvancedPayments($account, $date, $userId, $invoiceId);
        $rebates = $this->calculateRebates($account, $date, $monthlyFee);
        $serviceFees = $this->calculateServiceFees($account, $date, $userId);
        $paymentReceived = $this->calculatePaymentReceived($account, $date);

        return [
            'staggered_fees' => $staggeredFees,
            'staggered_install_fees' => $staggeredInstallFees,
            'discounts' => $discounts,
            'advanced_payments' => $advancedPayments,
            'rebates' => $rebates,
            'service_fees' => $serviceFees,
            'total_deductions' => $advancedPayments + $discounts + $rebates,
            'payment_received_previous' => $paymentReceived
        ];
    }

    protected function calculateStaggeredFees(BillingAccount $account, int $userId, string $invoiceId): float
    {
        $total = 0;

        $installments = Installment::where('account_id', $account->id)
            ->where('status', 'active')
            ->with('schedules')
            ->get();

        foreach ($installments as $installment) {
            $nextPendingSchedule = InstallmentSchedule::where('installment_id', $installment->id)
                ->where('status', 'pending')
                ->orderBy('installment_no', 'asc')
                ->first();

            if ($nextPendingSchedule) {
                $total += $nextPendingSchedule->amount;
                
                $nextPendingSchedule->update([
                    'invoice_id' => $invoiceId,
                    'status' => 'paid',
                    'updated_by' => $userId
                ]);

                $remainingSchedules = InstallmentSchedule::where('installment_id', $installment->id)
                    ->where('status', 'pending')
                    ->count();

                if ($remainingSchedules === 0) {
                    $installment->update([
                        'status' => 'completed',
                        'updated_by' => $userId
                    ]);
                }
            }
        }

        return round($total, 2);
    }

    protected function calculateStaggeredInstallFees(BillingAccount $account, int $userId, string $invoiceId): float
    {
        return 0;
    }

    protected function calculateDiscounts(BillingAccount $account, int $userId, string $invoiceId): float
    {
        $total = 0;

        $discounts = Discount::where('account_id', $account->id)
            ->whereIn('status', ['Unused', 'Permanent', 'Monthly'])
            ->get();

        foreach ($discounts as $discount) {
            if ($discount->status === 'Unused') {
                $total += $discount->discount_amount;
                $discount->update([
                    'status' => 'Used',
                    'invoice_used_id' => $invoiceId,
                    'used_date' => now(),
                    'updated_by' => $userId
                ]);
            } elseif ($discount->status === 'Permanent') {
                $total += $discount->discount_amount;
                $discount->update([
                    'invoice_used_id' => $invoiceId,
                    'updated_by' => $userId
                ]);
            } elseif ($discount->status === 'Monthly' && $discount->remaining > 0) {
                $total += $discount->discount_amount;
                $discount->update([
                    'invoice_used_id' => $invoiceId,
                    'remaining' => $discount->remaining - 1,
                    'updated_by' => $userId
                ]);
            }
        }

        return round($total, 2);
    }

    protected function calculateAdvancedPayments(
        BillingAccount $account, 
        Carbon $date, 
        int $userId, 
        string $invoiceId
    ): float {
        $total = 0;
        $currentMonth = $date->format('F');

        $advancedPayments = AdvancedPayment::where('account_id', $account->id)
            ->where('payment_month', $currentMonth)
            ->where('status', 'Unused')
            ->get();

        foreach ($advancedPayments as $payment) {
            $total += $payment->payment_amount;
            $payment->update([
                'status' => 'Used',
                'invoice_used_id' => $invoiceId,
                'updated_by' => $userId
            ]);
        }

        return round($total, 2);
    }

    protected function calculateRebates(BillingAccount $account, Carbon $date, float $monthlyFee): float
    {
        $total = 0;
        
        $customer = $account->customer;
        if (!$customer) {
            return 0;
        }

        $barangayCode = $customer->barangay_id ?? null;
        
        if (!$barangayCode) {
            return 0;
        }

        $billingDayToMatch = $account->billing_day === self::END_OF_MONTH_BILLING 
            ? $date->endOfMonth()->day 
            : $account->billing_day;

        $rebates = MassRebate::where(function($query) use ($barangayCode) {
                $query->where('barangay_code', $barangayCode)
                      ->orWhere('barangay_code', 'All');
            })
            ->where('billing_day', $billingDayToMatch)
            ->where('status', 'Unused')
            ->get();

        foreach ($rebates as $rebate) {
            $dailyRate = $monthlyFee / self::DAYS_IN_MONTH;
            $total += $dailyRate * $rebate->rebate_days;
        }

        return round($total, 2);
    }

    protected function calculateServiceFees(BillingAccount $account, Carbon $date, int $userId): float
    {
        $total = 0;

        $serviceFees = DB::table('service_charge_logs')
            ->where('account_id', $account->id)
            ->where('status', 'Unused')
            ->get();

        foreach ($serviceFees as $fee) {
            $total += $fee->service_charge;
            
            DB::table('service_charge_logs')
                ->where('id', $fee->id)
                ->update([
                    'status' => 'Used',
                    'date_used' => now(),
                    'updated_at' => now()
                ]);
        }

        return round($total, 2);
    }

    protected function calculatePaymentReceived(BillingAccount $account, Carbon $date): float
    {
        $lastMonth = $date->copy()->subMonth()->format('F');
        
        $lastInvoice = Invoice::where('account_id', $account->id)
            ->whereMonth('invoice_date', $date->copy()->subMonth()->month)
            ->whereYear('invoice_date', $date->copy()->subMonth()->year)
            ->first();

        if ($lastInvoice) {
            return $lastInvoice->received_payment ?? 0;
        }

        return 0;
    }

    protected function getDaysBetweenDatesIncludingDueDate(Carbon $startDate, Carbon $endDate): int
    {
        $endDateWithBuffer = $endDate->copy()->addDays(self::DAYS_UNTIL_DUE);
        return $startDate->diffInDays($endDateWithBuffer) + 1;
    }

    public function generateAllBillingsForToday(int $userId): array
    {
        $today = Carbon::now();
        $targetBillingDays = $this->calculateTargetBillingDays($today);
        $advanceGenerationDay = $this->getAdvanceGenerationDay();

        $results = [
            'date' => $today->format('Y-m-d'),
            'advance_generation_day' => $advanceGenerationDay,
            'billing_days_processed' => [],
            'invoices' => ['success' => 0, 'failed' => 0, 'errors' => []],
            'statements' => ['success' => 0, 'failed' => 0, 'errors' => []]
        ];

        foreach ($targetBillingDays as $billingDay) {
            $billingDayLabel = $billingDay === self::END_OF_MONTH_BILLING ? 'End of Month (0)' : "Day {$billingDay}";
            
            Log::info("Processing billing day: {$billingDayLabel}");
            
            $invoiceResults = $this->generateInvoicesForBillingDay($billingDay, $today, $userId);
            $soaResults = $this->generateSOAForBillingDay($billingDay, $today, $userId);
            
            $results['billing_days_processed'][] = $billingDayLabel;
            $results['invoices']['success'] += $invoiceResults['success'];
            $results['invoices']['failed'] += $invoiceResults['failed'];
            $results['invoices']['errors'] = array_merge($results['invoices']['errors'], $invoiceResults['errors']);
            
            $results['statements']['success'] += $soaResults['success'];
            $results['statements']['failed'] += $soaResults['failed'];
            $results['statements']['errors'] = array_merge($results['statements']['errors'], $soaResults['errors']);
        }

        return $results;
    }

    public function generateBillingsForSpecificDay(int $billingDay, int $userId): array
    {
        $today = Carbon::now();

        $invoiceResults = $this->generateInvoicesForBillingDay($billingDay, $today, $userId);
        $soaResults = $this->generateSOAForBillingDay($billingDay, $today, $userId);

        return [
            'date' => $today->format('Y-m-d'),
            'billing_day' => $billingDay === self::END_OF_MONTH_BILLING ? 'End of Month (0)' : $billingDay,
            'invoices' => $invoiceResults,
            'statements' => $soaResults
        ];
    }

    protected function extractPlanName(string $desiredPlan): string
    {
        if (strpos($desiredPlan, ' - ') !== false) {
            $parts = explode(' - ', $desiredPlan);
            return trim($parts[0]);
        }
        
        return trim($desiredPlan);
    }
}
