import type { ReactNode } from "react";

/** The frame every exercise sits in: a title, where you are, and the way on. */
export function QuizShell({
  title,
  progress,
  score,
  onNext,
  onRestart,
  nextLabel = "Next",
  children,
}: {
  title: string;
  progress?: string;
  score?: string;
  onNext?: () => void;
  onRestart?: () => void;
  nextLabel?: string;
  children: ReactNode;
}) {
  return (
    <div className="quiz panel-block">
      <div className="quiz__head">
        <h3 className="quiz__title">
          <span aria-hidden>✦ </span>
          {title}
        </h3>
        {progress ? <span className="quiz__progress">{progress}</span> : null}
      </div>
      {children}
      {score || onNext || onRestart ? (
        <div className="quiz__foot">
          {score ? <strong className="quiz__score">{score}</strong> : <span />}
          <div className="actions">
            {onRestart ? (
              <button type="button" className="btn" onClick={onRestart}>
                Start again
              </button>
            ) : null}
            {onNext ? (
              <button type="button" className="btn btn--primary" onClick={onNext}>
                {nextLabel}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** Right or not, said in words as well as color. */
export function Verdict({ right, children }: { right: boolean; children: ReactNode }) {
  return (
    <p className={right ? "verdict verdict--right" : "verdict verdict--wrong"} role="status">
      <strong>{right ? "✓ Right. " : "✗ Not quite. "}</strong>
      {children}
    </p>
  );
}
