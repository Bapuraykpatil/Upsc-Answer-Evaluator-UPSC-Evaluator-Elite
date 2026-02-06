from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..db.models.evaluation import Evaluation
from ..db.models.question import Question
from ..db.models.score import Score
from ..db.models.submission import Submission


async def evaluate_submission(db: AsyncSession, *, submission_id: int) -> Evaluation:
    res = await db.execute(select(Submission).where(Submission.id == submission_id))
    sub = res.scalar_one_or_none()
    if not sub:
        raise ValueError("Submission not found")

    qres = await db.execute(select(Question).where(Question.id == sub.question_id))
    q = qres.scalar_one()

    text = (sub.typed_text or "") + "\n" + (sub.ocr_text or "")
    length_score = min(len(text) / 800.0, 1.0)  # 0..1
    overall = round(length_score * float(q.max_marks), 2)

    feedback = {
        "summary": "Placeholder evaluation. AI evaluator will be plugged in next.",
        "tips": ["Add intro+conclusion", "Use headings", "Add examples/data"],
        "text_length": len(text),
    }

    eres = await db.execute(select(Evaluation).where(Evaluation.submission_id == submission_id))
    ev = eres.scalar_one_or_none()

    if ev is None:
        ev = Evaluation(submission_id=submission_id, overall_score=overall, feedback=feedback)
        db.add(ev)
        await db.flush()  # get ev.id before commit

        db.add_all(
            [
                Score(evaluation_id=ev.id, criterion="structure", score=overall * 0.3, max_score=q.max_marks * 0.3),
                Score(evaluation_id=ev.id, criterion="content", score=overall * 0.5, max_score=q.max_marks * 0.5),
                Score(evaluation_id=ev.id, criterion="language", score=overall * 0.2, max_score=q.max_marks * 0.2),
            ]
        )
    else:
        ev.overall_score = overall
        ev.feedback = feedback

    await db.commit()
    await db.refresh(ev)
    return ev