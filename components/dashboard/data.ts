export type EvidenceKind =
  | "Purchase Order"
  | "Invoice"
  | "Delivery"
  | "Email"
  | "Payment"
  | "Follow-up";

export type EvidenceItem = {
  claim: string;
  source: string;
  kind: EvidenceKind;
  status: "verified" | "partial" | "unverified";
};

export type PolicyCheck = {
  rule: string;
  detail: string;
  result: "permit" | "review" | "deny";
};

export type CaseStatus = "Overdue" | "Awaiting" | "Disputed";

export type Case = {
  id: string;
  buyer: string;
  buyerShort: string;
  invoiced: number;
  received: number;
  terms: number;
  overdueDays: number;
  dueDate: string;
  acknowledged: boolean;
  status: CaseStatus;
  action: "WAIT" | "FOLLOW UP" | "ESCALATE" | "HUMAN REVIEW";
  rationale: string;
  confidence: number;
  evidence: EvidenceItem[];
  policy: PolicyCheck[];
  timeline: { when: string; what: string }[];
};

export const inr = (v: number) => `₹${Math.round(v).toLocaleString("en-IN")}`;
export const outstanding = (c: Case) => c.invoiced - c.received;

export const CASES: Case[] = [
  {
    id: "CS-2041",
    buyer: "Meridian Traders Pvt Ltd",
    buyerShort: "Meridian Traders",
    invoiced: 480000,
    received: 0,
    terms: 30,
    overdueDays: 45,
    dueDate: "04 Feb 2026",
    acknowledged: true,
    status: "Overdue",
    action: "ESCALATE",
    rationale:
      "Obligation is fully evidenced, delivery is confirmed, the buyer acknowledged the balance in writing, and two reminders went unanswered.",
    confidence: 0.92,
    evidence: [
      { claim: "30-day payment terms", source: "Purchase Order PO-8841 · Page 2", kind: "Purchase Order", status: "verified" },
      { claim: "₹4,80,000 invoiced", source: "Invoice INV-3382 · Page 1", kind: "Invoice", status: "verified" },
      { claim: "Goods delivered in full", source: "Dispatch note DN-2291", kind: "Delivery", status: "verified" },
      { claim: "Buyer acknowledged balance", source: "Email · Thread 17", kind: "Email", status: "verified" },
      { claim: "No payment received", source: "Bank statement · Feb 2026", kind: "Payment", status: "verified" },
      { claim: "Two reminders sent", source: "Follow-up log · 18 Feb, 02 Mar", kind: "Follow-up", status: "partial" },
    ],
    policy: [
      { rule: "obligation_is_evidenced", detail: "Invoice, PO and delivery note all resolved", result: "permit" },
      { rule: "payment_is_overdue", detail: "45 days past due date", result: "permit" },
      { rule: "escalation_threshold", detail: "Outstanding above ₹2,00,000", result: "permit" },
      { rule: "human_review_required", detail: "No active dispute on record", result: "deny" },
    ],
    timeline: [
      { when: "12 Jan 2026", what: "Invoice INV-3382 raised for ₹4,80,000" },
      { when: "28 Jan 2026", what: "Dispatch note DN-2291 issued" },
      { when: "04 Feb 2026", what: "Payment due — nothing received" },
      { when: "18 Feb 2026", what: "Reminder 1 sent" },
      { when: "02 Mar 2026", what: "Reminder 2 sent — no response" },
    ],
  },
  {
    id: "CS-2038",
    buyer: "Kalyani Steel Works",
    buyerShort: "Kalyani Steel",
    invoiced: 1250000,
    received: 600000,
    terms: 45,
    overdueDays: 18,
    dueDate: "16 Feb 2026",
    acknowledged: true,
    status: "Overdue",
    action: "FOLLOW UP",
    rationale:
      "Part payment received against the invoice. The remaining balance sits below the escalation threshold, so a structured reminder is the permitted next step.",
    confidence: 0.86,
    evidence: [
      { claim: "45-day payment terms", source: "Contract CTR-1120 · Clause 7", kind: "Purchase Order", status: "verified" },
      { claim: "₹12,50,000 invoiced", source: "Invoice INV-3344 · Page 1", kind: "Invoice", status: "verified" },
      { claim: "₹6,00,000 received", source: "Payment record PR-7781", kind: "Payment", status: "verified" },
      { claim: "Balance ₹6,50,000 outstanding", source: "Case Engine calculation", kind: "Invoice", status: "verified" },
      { claim: "Partial-payment email", source: "Email · Thread 12", kind: "Email", status: "partial" },
    ],
    policy: [
      { rule: "obligation_is_evidenced", detail: "Contract and invoice resolved", result: "permit" },
      { rule: "payment_is_overdue", detail: "18 days past due date", result: "permit" },
      { rule: "escalation_threshold", detail: "Not met on current balance", result: "deny" },
      { rule: "reminder_cooloff", detail: "Last reminder 14 days ago", result: "permit" },
    ],
    timeline: [
      { when: "22 Jan 2026", what: "Invoice INV-3344 raised" },
      { when: "16 Feb 2026", what: "Payment due" },
      { when: "20 Feb 2026", what: "₹6,00,000 part payment received" },
      { when: "27 Feb 2026", what: "Buyer cites internal approval delay" },
    ],
  },
  {
    id: "CS-2033",
    buyer: "Nova Interiors LLP",
    buyerShort: "Nova Interiors",
    invoiced: 215000,
    received: 0,
    terms: 15,
    overdueDays: 6,
    dueDate: "28 Feb 2026",
    acknowledged: false,
    status: "Awaiting",
    action: "WAIT",
    rationale:
      "Payment is only 6 days past due and the customer's standard practice is settlement within the cool-off window. Hold and keep the evidence set warm.",
    confidence: 0.74,
    evidence: [
      { claim: "15-day payment terms", source: "Purchase Order PO-8830 · Page 1", kind: "Purchase Order", status: "verified" },
      { claim: "₹2,15,000 invoiced", source: "Invoice INV-3361 · Page 1", kind: "Invoice", status: "verified" },
      { claim: "Services delivered", source: "Delivery record DR-4410", kind: "Delivery", status: "verified" },
      { claim: "No acknowledgement yet", source: "Email · Thread 9", kind: "Email", status: "unverified" },
    ],
    policy: [
      { rule: "obligation_is_evidenced", detail: "PO and invoice resolved", result: "permit" },
      { rule: "reminder_cooloff", detail: "Within 10-day first-reminder window", result: "permit" },
      { rule: "escalation_threshold", detail: "Not met", result: "deny" },
    ],
    timeline: [
      { when: "13 Feb 2026", what: "Invoice INV-3361 raised" },
      { when: "28 Feb 2026", what: "Payment due" },
      { when: "06 Mar 2026", what: "Case reconstructed from 4 sources" },
    ],
  },
  {
    id: "CS-2029",
    buyer: "Sunrise Logistics Ltd",
    buyerShort: "Sunrise Logistics",
    invoiced: 740000,
    received: 0,
    terms: 30,
    overdueDays: 62,
    dueDate: "18 Jan 2026",
    acknowledged: true,
    status: "Disputed",
    action: "HUMAN REVIEW",
    rationale:
      "The buyer disputes two line items on the delivery record. Calculations disagree with the acknowledged amount, so the case is routed to a person.",
    confidence: 0.61,
    evidence: [
      { claim: "30-day payment terms", source: "Contract CTR-1098 · Clause 4", kind: "Purchase Order", status: "verified" },
      { claim: "₹7,40,000 invoiced", source: "Invoice INV-3312 · Page 1", kind: "Invoice", status: "verified" },
      { claim: "2 line items short-delivered", source: "Dispatch note DN-2264", kind: "Delivery", status: "partial" },
      { claim: "Buyer disputes amount", source: "Email · Thread 21", kind: "Email", status: "verified" },
      { claim: "No payment received", source: "Bank statement · Mar 2026", kind: "Payment", status: "verified" },
    ],
    policy: [
      { rule: "obligation_is_evidenced", detail: "Amount contradiction across sources", result: "review" },
      { rule: "active_dispute", detail: "Buyer dispute open since 21 Feb", result: "review" },
      { rule: "auto_escalation", detail: "Blocked while a dispute is open", result: "deny" },
    ],
    timeline: [
      { when: "19 Dec 2025", what: "Invoice INV-3312 raised" },
      { when: "18 Jan 2026", what: "Payment due" },
      { when: "21 Feb 2026", what: "Buyer raises dispute on 2 line items" },
      { when: "05 Mar 2026", what: "Contradiction flagged across delivery vs invoice" },
    ],
  },
];
