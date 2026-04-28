"use client";

import { useState } from "react";
import Link from "next/link";
import { askQuestion, answerQuestion } from "@/lib/listing-actions";

interface Question {
  id: string;
  body: string;
  createdAt: Date;
  asker: { name: string; company: string | null };
  answers: {
    id: string;
    body: string;
    createdAt: Date;
    responder: { name: string; company: string | null };
  }[];
}

interface Props {
  listingType: "dc" | "land";
  listingId: string;
  listingOwnerId: string;
  questions: Question[];
  currentUser: { id: string; email: string; name: string } | null;
  isOwner: boolean;
}

const SUGGESTED = [
  "Is water available on site? Source and capacity?",
  "What stage is the interconnection process at?",
  "What's the current PPA status and price?",
  "What's the condition of the site / facility?",
  "Are there any zoning or environmental restrictions?",
  "What's the typical lead time to energization?",
];

export function QAndA({
  listingType,
  listingId,
  listingOwnerId,
  questions,
  currentUser,
  isOwner,
}: Props) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const handleAsk = async (formData: FormData) => {
    setPending(true);
    setError(null);
    const result = await askQuestion(listingType, listingId, formData);
    setPending(false);
    if (result && "error" in result && result.error) setError(result.error);
    else setDraft("");
  };

  return (
    <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-xl font-semibold text-slate-900">Questions & Answers</h2>
      <p className="mt-1 text-sm text-slate-600">
        Ask about water, condition, PPA, interconnection stage, or anything else.
        The owner is notified and can respond publicly.
      </p>

      {currentUser ? (
        <form action={handleAsk} className="mt-6 space-y-3">
          <div className="flex flex-wrap gap-2">
            {SUGGESTED.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setDraft(q)}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700 hover:border-brand-500 hover:bg-brand-50"
              >
                {q}
              </button>
            ))}
          </div>
          <textarea
            name="body"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            placeholder="Ask a question about this listing..."
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={pending || draft.trim().length < 3}
              className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {pending ? "Posting..." : "Post question"}
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-6 rounded-md bg-slate-50 p-4 text-sm text-slate-700">
          <Link href="/auth/signin" className="font-medium text-brand-600 hover:underline">
            Sign in
          </Link>{" "}
          to ask a question.
        </div>
      )}

      <div className="mt-8 space-y-6">
        {questions.length === 0 && (
          <p className="text-sm text-slate-500">No questions yet.</p>
        )}
        {questions.map((q) => (
          <QuestionThread
            key={q.id}
            question={q}
            listingType={listingType}
            listingId={listingId}
            isOwner={isOwner}
            canAnswer={!!currentUser}
          />
        ))}
      </div>
    </div>
  );
}

function QuestionThread({
  question,
  listingType,
  listingId,
  isOwner,
  canAnswer,
}: {
  question: Question;
  listingType: "dc" | "land";
  listingId: string;
  isOwner: boolean;
  canAnswer: boolean;
}) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnswer = async (formData: FormData) => {
    setPending(true);
    setError(null);
    const result = await answerQuestion(
      listingType,
      listingId,
      question.id,
      formData
    );
    setPending(false);
    if (result && "error" in result && result.error) setError(result.error);
    else setShowAnswer(false);
  };

  return (
    <div className="border-l-2 border-slate-200 pl-4">
      <div className="text-sm">
        <span className="font-medium text-slate-900">
          {question.asker.company || question.asker.name}
        </span>
        <span className="ml-2 text-slate-500">
          asked {new Date(question.createdAt).toLocaleDateString()}
        </span>
      </div>
      <p className="mt-1 text-slate-800">{question.body}</p>

      <div className="mt-3 ml-4 space-y-3">
        {question.answers.map((a) => (
          <div key={a.id} className="rounded-md bg-slate-50 p-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-900">
                {a.responder.company || a.responder.name}
              </span>
              <span className="text-xs text-slate-500">
                {new Date(a.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="mt-1 text-slate-700 whitespace-pre-wrap">{a.body}</p>
          </div>
        ))}

        {canAnswer && !showAnswer && (
          <button
            onClick={() => setShowAnswer(true)}
            className="text-sm text-brand-600 hover:underline"
          >
            {isOwner ? "Answer this" : "Reply"}
          </button>
        )}
        {showAnswer && (
          <form action={handleAnswer} className="space-y-2">
            <textarea
              name="body"
              rows={3}
              required
              placeholder="Your response..."
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={pending}
                className="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
              >
                {pending ? "Posting..." : "Post answer"}
              </button>
              <button
                type="button"
                onClick={() => setShowAnswer(false)}
                className="rounded-md px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
