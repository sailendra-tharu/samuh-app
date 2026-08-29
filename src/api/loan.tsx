import { supabase } from "@/lib/supabase";

export interface Loan {
  id?: number;
  status: LoanStatus;
  renewedFromLoanId: number | null;
  memberId: number | null;
  name: string;
  loanDate: string;
  loanTermYears: number | null;
  description: string;
  principalAmount: number | null;
  fineIn: number | null;
  fineOut: number | null;
  interest: number | null;
  emi: number | null;
  renewalPaid: number;
  paidAmount: number;
  remainingPrincipal: number | null;
  payments: LoanPayment[];
}

export type LoanStatus = "active" | "paid" | "renewed";

export interface LoanPayment {
  id?: number;
  loanId: number;
  paymentDate: string;
  amount: number;
  finePaid: number;
  renewalPaid: number;
}

type RawLoan = {
  id: number;
  loan_status?: string | null;
  renewed_from_loan_id?: number | null;
  member_id: number;
  loan_date: string;
  loan_term_years?: number | string | null;
  description: string | null;
  principal_amount: number | string | null;
  fine_in: number | string | null;
  fine_out: number | string | null;
  interest: number | string | null;
  emi: number | string | null;
  renewal_paid?: number | string | null;
  members?: { name: string } | null;
  loan_payments?: RawLoanPayment[] | null;
};

type RawLoanPayment = {
  id: number;
  payment_date: string;
  amount: number | string | null;
  fine_paid?: number | string | null;
  renewal_paid?: number | string | null;
};

const loanSelect =
  "*, members(name), loan_payments(id, payment_date, amount, fine_paid, renewal_paid)";
const legacyLoanSelect =
  "*, members(name), loan_payments(id, payment_date, amount)";
const loanBaseSelect = "*, members(name)";

const getSupabaseErrorMessage = (error: unknown) => {
  if (error && typeof error === "object") {
    const supabaseError = error as {
      message?: unknown;
      details?: unknown;
      hint?: unknown;
    };
    const message =
      typeof supabaseError.message === "string"
        ? supabaseError.message
        : "Unknown Supabase error";
    const details =
      typeof supabaseError.details === "string"
        ? ` ${supabaseError.details}`
        : "";
    const hint =
      typeof supabaseError.hint === "string" ? ` ${supabaseError.hint}` : "";

    return `${message}${details}${hint}`;
  }

  return "Unknown Supabase error";
};

const isMissingRenewalPaidColumnError = (error: unknown) => {
  const message = getSupabaseErrorMessage(error).toLowerCase();
  return (
    message.includes("renewal_paid") &&
    (message.includes("schema cache") || message.includes("does not exist"))
  );
};

const isMissingPaymentBreakdownColumnError = (error: unknown) => {
  const message = getSupabaseErrorMessage(error).toLowerCase();
  const missingColumn =
    message.includes("fine_paid") || message.includes("renewal_paid");

  return (
    missingColumn &&
    (message.includes("schema cache") || message.includes("does not exist"))
  );
};

export const calculateLoanInterest = (principalAmount: number | null) => {
  if (principalAmount === null || !Number.isFinite(principalAmount)) {
    return null;
  }

  const principal = Math.max(0, principalAmount);
  const firstTier = Math.min(principal, 50_000) * 0.0075;
  const secondTier = Math.max(principal - 50_000, 0) * 0.01;

  return Math.round(firstTier + secondTier);
};

export const calculateLoanEmi = (
  principalAmount: number | null,
  loanTermYears: number | null
) => {
  if (
    principalAmount === null ||
    loanTermYears === null ||
    !Number.isFinite(principalAmount) ||
    !Number.isFinite(loanTermYears) ||
    principalAmount <= 0 ||
    loanTermYears <= 0
  ) {
    return null;
  }

  const totalMonths = loanTermYears * 12;
  const monthlyPrincipal = principalAmount / totalMonths;
  const monthlyInterest = calculateLoanInterest(principalAmount) ?? 0;

  return Math.round(monthlyPrincipal + monthlyInterest);
};

export const calculateRemainingPrincipal = (
  principalAmount: number | null,
  paidAmount: number | null
) => {
  if (principalAmount === null || !Number.isFinite(principalAmount)) {
    return null;
  }

  const principal = Math.max(0, principalAmount);
  const payment =
    paidAmount === null || !Number.isFinite(paidAmount)
      ? 0
      : Math.max(0, paidAmount);

  return Math.max(0, principal - payment);
};

export const calculateRemainingFine = (
  fineIn: number | null,
  fineOut: number | null
) => {
  const assessedFine =
    fineIn === null || !Number.isFinite(fineIn) ? 0 : Math.max(0, fineIn);
  const paidFine =
    fineOut === null || !Number.isFinite(fineOut) ? 0 : Math.max(0, fineOut);

  return Math.max(0, assessedFine - paidFine);
};

export const calculateRemainingRenewalInterest = (
  remainingPrincipal: number | null,
  renewalPaid: number | null
) => {
  const renewalInterest = calculateLoanInterest(remainingPrincipal) ?? 0;
  const paid =
    renewalPaid === null || !Number.isFinite(renewalPaid)
      ? 0
      : Math.max(0, renewalPaid);

  return Math.max(0, renewalInterest - paid);
};

export const isLoanTermExpired = (
  loanDate: string,
  loanTermYears: number | null
) => {
  if (!loanTermYears) return false;

  const maturityDate = new Date(`${loanDate}T00:00:00`);
  maturityDate.setFullYear(maturityDate.getFullYear() + loanTermYears);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return today >= maturityDate;
};

const toNumberOrNull = (value: number | string | null | undefined) =>
  value == null ? null : Number(value);

const toLoan = (loan: RawLoan): Loan => {
  const principalAmount = toNumberOrNull(loan.principal_amount);
  const fineIn = toNumberOrNull(loan.fine_in);
  const fineOut = toNumberOrNull(loan.fine_out);
  const renewalPaid = toNumberOrNull(loan.renewal_paid) ?? 0;
  const payments = (loan.loan_payments ?? []).map((payment) => ({
    id: payment.id,
    loanId: loan.id,
    paymentDate: payment.payment_date,
    amount: payment.amount === null ? 0 : Number(payment.amount),
    finePaid:
      payment.fine_paid === null || payment.fine_paid === undefined
        ? 0
        : Number(payment.fine_paid),
    renewalPaid:
      payment.renewal_paid === null || payment.renewal_paid === undefined
        ? 0
        : Number(payment.renewal_paid),
  }));
  const paidAmount = (loan.loan_payments ?? []).reduce(
    (total, payment) =>
      total + (payment.amount === null ? 0 : Number(payment.amount)),
    0
  );
  const remainingPrincipal = calculateRemainingPrincipal(
    principalAmount,
    paidAmount
  );
  const remainingFine = calculateRemainingFine(fineIn, fineOut);
  const status: LoanStatus =
    loan.loan_status === "renewed"
      ? "renewed"
      : remainingPrincipal === 0 && remainingFine === 0
        ? "paid"
        : "active";

  return {
    id: loan.id,
    status,
    renewedFromLoanId: loan.renewed_from_loan_id ?? null,
    memberId: loan.member_id,
    name: loan.members?.name ?? "",
    loanDate: loan.loan_date,
    loanTermYears: toNumberOrNull(loan.loan_term_years),
    description: loan.description ?? "",
    principalAmount,
    fineIn,
    fineOut,
    interest: calculateLoanInterest(remainingPrincipal),
    emi:
      calculateLoanEmi(
        principalAmount,
        toNumberOrNull(loan.loan_term_years)
      ) ?? toNumberOrNull(loan.emi),
    renewalPaid,
    paidAmount,
    remainingPrincipal,
    payments,
  };
};

export async function getLoans() {
  const { data, error } = await supabase
    .from("loans")
    .select(loanSelect)
    .order("loan_date", { ascending: false })
    .order("id", { ascending: false });

  if (!error) return data.map(toLoan);

  const legacy = await supabase
    .from("loans")
    .select(legacyLoanSelect)
    .order("loan_date", { ascending: false })
    .order("id", { ascending: false });

  if (!legacy.error) return legacy.data.map(toLoan);

  // Keep existing loan records visible even before loan_payments is created.
  const fallback = await supabase
    .from("loans")
    .select(loanBaseSelect)
    .order("loan_date", { ascending: false })
    .order("id", { ascending: false });

  if (fallback.error) throw fallback.error;

  return fallback.data.map((loan) => toLoan({ ...loan, loan_payments: [] }));
}

export async function getLoanById(id: number) {
  const { data, error } = await supabase
    .from("loans")
    .select(loanSelect)
    .eq("id", id)
    .maybeSingle();

  if (!error) {
    if (!data) return null;
    return toLoan(data);
  }

  const legacy = await supabase
    .from("loans")
    .select(legacyLoanSelect)
    .eq("id", id)
    .maybeSingle();

  if (!legacy.error) {
    if (!legacy.data) return null;
    return toLoan(legacy.data);
  }

  const fallback = await supabase
    .from("loans")
    .select(loanBaseSelect)
    .eq("id", id)
    .maybeSingle();

  if (fallback.error) throw fallback.error;
  if (!fallback.data) return null;

  return toLoan({ ...fallback.data, loan_payments: [] });
}

async function resolveMember(loan: Loan) {
  if (loan.memberId !== null) {
    const { data, error } = await supabase
      .from("members")
      .select("id, name")
      .eq("id", loan.memberId)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      throw new Error("The selected member no longer exists.");
    }

    return data;
  }

  const memberName = loan.name.trim();

  if (!memberName) {
    throw new Error("Member name is required for this loan.");
  }

  const { data, error } = await supabase
    .from("members")
    .select("id, name")
    .ilike("name", memberName)
    .limit(2);

  if (error) throw error;

  if (data.length === 0) {
    throw new Error(`No registered member found with the name "${memberName}".`);
  }

  if (data.length > 1) {
    throw new Error(
      `More than one member has the name "${memberName}". Please use a unique name.`
    );
  }

  return data[0];
}

async function ensureMemberCanTakeLoan(memberId: number, currentLoanId?: number) {
  const { data, error } = await supabase
    .from("loans")
    .select(
      "id, loan_status, principal_amount, fine_in, fine_out, loan_payments(amount)"
    )
    .eq("member_id", memberId);

  if (error) throw error;

  const activeLoan = data.find((loan) => {
    if (currentLoanId !== undefined && loan.id === currentLoanId) {
      return false;
    }

    if (loan.loan_status === "renewed") return false;

    if (loan.principal_amount === null && loan.fine_in === null) return false;

    const paidAmount = (loan.loan_payments ?? []).reduce(
      (total, payment) => total + Number(payment.amount ?? 0),
      0
    );

    const remainingPrincipal =
      loan.principal_amount === null
        ? 0
        : calculateRemainingPrincipal(Number(loan.principal_amount), paidAmount) ??
          0;
    const remainingFine = calculateRemainingFine(
      loan.fine_in === null ? null : Number(loan.fine_in),
      loan.fine_out === null ? null : Number(loan.fine_out)
    );

    return remainingPrincipal > 0 || remainingFine > 0;
  });

  if (activeLoan) {
    throw new Error(
      "This member already has an active loan. The existing loan must be fully paid before taking another loan."
    );
  }
}

const toLoanRow = (loan: Loan, memberId: number) => ({
  // Interest is based on the current balance, not the original principal.
  // paidAmount comes from the existing payment history when updating a loan.
  interest: calculateLoanInterest(
    calculateRemainingPrincipal(loan.principalAmount, loan.paidAmount)
  ),
  loan_status: loan.status,
  renewed_from_loan_id: loan.renewedFromLoanId,
  member_id: memberId,
  loan_date: loan.loanDate,
  loan_term_years: loan.loanTermYears,
  description: loan.description || null,
  principal_amount: loan.principalAmount,
  fine_in: loan.fineIn,
  fine_out: loan.fineOut ?? 0,
  emi: calculateLoanEmi(loan.principalAmount, loan.loanTermYears) ?? loan.emi,
});

export async function createLoan(loan: Loan) {
  const member = await resolveMember(loan);
  await ensureMemberCanTakeLoan(member.id);

  const { data, error } = await supabase
    .from("loans")
    .insert(toLoanRow(loan, member.id))
    .select(loanBaseSelect)
    .single();

  if (error) throw error;

  return toLoan({ ...data, loan_payments: [] });
}

export async function updateLoan(loan: Loan) {
  if (loan.id === undefined) {
    throw new Error("Loan id is required to update a loan.");
  }

  const member = await resolveMember(loan);
  await ensureMemberCanTakeLoan(member.id, loan.id);

  const { data, error } = await supabase
    .from("loans")
    .update(toLoanRow(loan, member.id))
    .eq("id", loan.id)
    .select(loanBaseSelect)
    .single();

  if (error) throw error;

  return toLoan({ ...data, loan_payments: [] });
}

export async function deleteLoan(id: number) {
  const { error } = await supabase.from("loans").delete().eq("id", id);

  if (error) throw error;
}

const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export async function renewLoan(loanId: number) {
  const { data, error } = await supabase
    .from("loans")
    .select(loanSelect)
    .eq("id", loanId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("The selected loan no longer exists.");

  const loan = toLoan(data);

  if (loan.status === "renewed") {
    throw new Error("This loan has already been renewed.");
  }

  if (loan.status === "paid" || loan.remainingPrincipal === 0) {
    throw new Error("This loan is already fully paid and does not need renewal.");
  }

  if (loan.remainingPrincipal === null) {
    throw new Error("A loan with no principal amount cannot be renewed.");
  }

  if (loan.memberId === null) {
    throw new Error("A loan without a linked member cannot be renewed.");
  }

  if (!loan.loanTermYears || loan.loanTermYears <= 0) {
    throw new Error("Loan term is required before renewing this loan.");
  }

  const renewalInterest = calculateLoanInterest(loan.remainingPrincipal);
  const renewalEmi = calculateLoanEmi(
    loan.remainingPrincipal,
    loan.loanTermYears
  );

  const { data: renewedLoan, error: renewalError } = await supabase
    .from("loans")
    .insert({
      member_id: loan.memberId,
      loan_date: formatLocalDate(new Date()),
      loan_term_years: loan.loanTermYears,
      description: `Renewal of loan #${loan.id}`,
      principal_amount: loan.remainingPrincipal,
      fine_in: null,
      fine_out: null,
      interest: renewalInterest,
      emi: renewalEmi,
      loan_status: "active",
      renewed_from_loan_id: loan.id,
    })
    .select(loanBaseSelect)
    .single();

  if (renewalError) throw renewalError;

  const { error: markRenewedError } = await supabase
    .from("loans")
    .update({ loan_status: "renewed" })
    .eq("id", loan.id);

  if (markRenewedError) throw markRenewedError;

  return toLoan({ ...renewedLoan, loan_payments: [] });
}

export async function createLoanPayment(payment: LoanPayment) {
  if (payment.loanId === undefined) {
    throw new Error("Loan id is required to record a payment.");
  }

  if (!Number.isInteger(payment.amount) || payment.amount < 0) {
    throw new Error("Payment amount must be a whole number of 0 or more.");
  }

  if (!Number.isInteger(payment.finePaid) || payment.finePaid < 0) {
    throw new Error("Fine paid must be a whole number of 0 or more.");
  }

  if (!Number.isInteger(payment.renewalPaid) || payment.renewalPaid < 0) {
    throw new Error("Renewal paid must be a whole number of 0 or more.");
  }

  if (
    payment.amount === 0 &&
    payment.finePaid === 0 &&
    payment.renewalPaid === 0
  ) {
    throw new Error("Enter a principal, fine, or renewal payment.");
  }

  let renewalPaidColumnAvailable = true;
  let { data: loan, error: loanError } = await supabase
    .from("loans")
    .select(
      "principal_amount, fine_in, fine_out, renewal_paid, loan_date, loan_term_years"
    )
    .eq("id", payment.loanId)
    .maybeSingle();

  if (loanError && isMissingRenewalPaidColumnError(loanError)) {
    renewalPaidColumnAvailable = false;
    const fallback = await supabase
      .from("loans")
      .select("principal_amount, fine_in, fine_out, loan_date, loan_term_years")
      .eq("id", payment.loanId)
      .maybeSingle();

    loan = fallback.data
      ? { ...fallback.data, renewal_paid: null }
      : null;
    loanError = fallback.error;
  }

  if (loanError) throw loanError;

  if (!loan || loan.principal_amount === null) {
    throw new Error("The selected loan no longer exists.");
  }

  const { data: previousPayments, error: paymentsError } = await supabase
    .from("loan_payments")
    .select("amount")
    .eq("loan_id", payment.loanId);

  if (paymentsError) {
    const message = getSupabaseErrorMessage(paymentsError);

    if (
      message.toLowerCase().includes("loan_payments") &&
      message.toLowerCase().includes("does not exist")
    ) {
      throw new Error(
        "The loan_payments table does not exist. Create it in Supabase before recording payments."
      );
    }

    throw new Error(message);
  }

  const paidAmount = previousPayments.reduce(
    (total, previousPayment) => total + Number(previousPayment.amount ?? 0),
    0
  );
  const remainingPrincipal = calculateRemainingPrincipal(
    Number(loan.principal_amount),
    paidAmount
  );

  if (remainingPrincipal !== null && payment.amount > remainingPrincipal) {
    throw new Error(
      `Payment cannot be greater than the remaining principal of ${remainingPrincipal.toLocaleString()}.`
    );
  }

  const currentFineOut =
    loan.fine_out === null ? 0 : Math.max(0, Number(loan.fine_out));
  const remainingFine = calculateRemainingFine(
    loan.fine_in === null ? null : Number(loan.fine_in),
    currentFineOut
  );

  if (payment.finePaid > remainingFine) {
    throw new Error(
      `Fine payment cannot be greater than the remaining fine of ${remainingFine.toLocaleString()}.`
    );
  }

  const currentRenewalPaid =
    loan.renewal_paid === null ? 0 : Math.max(0, Number(loan.renewal_paid));
  const renewalIsDue =
    remainingPrincipal !== null &&
    remainingPrincipal > 0 &&
    isLoanTermExpired(
      loan.loan_date,
      loan.loan_term_years === null ? null : Number(loan.loan_term_years)
    );
  const remainingRenewalInterest = renewalIsDue
    ? calculateRemainingRenewalInterest(remainingPrincipal, currentRenewalPaid)
    : 0;

  if (payment.renewalPaid > 0 && !renewalIsDue) {
    throw new Error("Renewal payment is not due for this loan yet.");
  }

  if (payment.renewalPaid > remainingRenewalInterest) {
    throw new Error(
      `Renewal payment cannot be greater than the remaining renewal interest of ${remainingRenewalInterest.toLocaleString()}.`
    );
  }

  if (payment.renewalPaid > 0 && !renewalPaidColumnAvailable) {
    throw new Error(
      "Renewal payment needs the renewal_paid column. Run the Supabase migration first."
    );
  }

  let { data, error } = await supabase
    .from("loan_payments")
    .insert({
      loan_id: payment.loanId,
      payment_date: payment.paymentDate,
      amount: payment.amount,
      fine_paid: payment.finePaid,
      renewal_paid: payment.renewalPaid,
    })
    .select()
    .single();

  if (error && isMissingPaymentBreakdownColumnError(error)) {
    const legacyInsert = await supabase
      .from("loan_payments")
      .insert({
        loan_id: payment.loanId,
        payment_date: payment.paymentDate,
        amount: payment.amount,
      })
      .select()
      .single();

    data = legacyInsert.data;
    error = legacyInsert.error;
  }

  if (error) throw new Error(getSupabaseErrorMessage(error));

  if (payment.finePaid > 0 || payment.renewalPaid > 0) {
    const loanUpdates: {
      fine_out?: number;
      renewal_paid?: number;
    } = {};

    if (payment.finePaid > 0) {
      loanUpdates.fine_out = currentFineOut + payment.finePaid;
    }

    if (payment.renewalPaid > 0) {
      loanUpdates.renewal_paid = currentRenewalPaid + payment.renewalPaid;
    }

    const { error: fineError } = await supabase
      .from("loans")
      .update(loanUpdates)
      .eq("id", payment.loanId);

    if (fineError) throw new Error(getSupabaseErrorMessage(fineError));
  }

  return {
    id: data.id,
    loanId: data.loan_id,
    paymentDate: data.payment_date,
    amount: Number(data.amount),
    finePaid: payment.finePaid,
    renewalPaid: payment.renewalPaid,
  } satisfies LoanPayment;
}

export async function searchLoans(query: string) {
  const loans = await getLoans();
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) return loans;

  return loans.filter(
    (loan) =>
      loan.name.toLowerCase().includes(normalizedQuery) ||
      loan.description.toLowerCase().includes(normalizedQuery)
  );
}
