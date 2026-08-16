import { useMemo } from "react";

function formatPercent(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "—";
  }

  return `${Number(value).toFixed(1)}%`;
}

function SummaryCard({ label, value, description }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <p className="text-xs text-slate-500 mb-1">{label}</p>

      <p className="text-xl font-semibold text-slate-800">
        {value}
      </p>

      {description && (
        <p className="text-xs text-slate-400 mt-1">
          {description}
        </p>
      )}
    </div>
  );
}

function EmptyAnalytics({ message = "No result data available yet." }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  );
}

function SubjectPerformance({ subjects }) {
  if (!subjects.length) {
    return <EmptyAnalytics message="No subject performance data available." />;
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-700">
          Subject Performance
        </h3>

        <p className="text-xs text-slate-400 mt-1">
          Average performance across subjects.
        </p>
      </div>

      <div className="space-y-4">
        {subjects.map((subject) => {
          const score = Number(subject.average) || 0;

          return (
            <div key={subject.subject_id || subject.subject_name}>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-sm text-slate-600">
                  {subject.subject_name}
                </p>

                <p className="text-sm font-medium text-slate-700">
                  {formatPercent(score)}
                </p>
              </div>

              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#0A2472] rounded-full transition-all"
                  style={{
                    width: `${Math.min(Math.max(score, 0), 100)}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TermPerformance({ terms }) {
  if (!terms.length) {
    return <EmptyAnalytics message="No term performance data available." />;
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-700">
          Performance by Term
        </h3>

        <p className="text-xs text-slate-400 mt-1">
          Average score across academic terms.
        </p>
      </div>

      <div className="space-y-3">
        {terms.map((term) => {
          const average = Number(term.average) || 0;

          return (
            <div
              key={`${term.academic_session}-${term.term}`}
              className="flex items-center gap-4"
            >
              <div className="w-32 shrink-0">
                <p className="text-sm text-slate-700">
                  {term.term}
                </p>

                <p className="text-[11px] text-slate-400">
                  {term.academic_session}
                </p>
              </div>

              <div className="flex-1">
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0A2472] rounded-full"
                    style={{
                      width: `${Math.min(
                        Math.max(average, 0),
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <p className="text-sm font-medium text-slate-700 w-14 text-right">
                {formatPercent(average)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ClassPerformance({ classes }) {
  if (!classes.length) {
    return <EmptyAnalytics message="No class performance data available." />;
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-700">
          Class Performance
        </h3>

        <p className="text-xs text-slate-400 mt-1">
          Average results by class.
        </p>
      </div>

      <div className="space-y-4">
        {classes.map((item) => {
          const average = Number(item.average) || 0;

          return (
            <div key={item.class_name}>
              <div className="flex justify-between mb-1.5">
                <p className="text-sm text-slate-600">
                  {item.class_name}
                </p>

                <p className="text-sm font-medium text-slate-700">
                  {formatPercent(average)}
                </p>
              </div>

              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#0A2472] rounded-full"
                  style={{
                    width: `${Math.min(
                      Math.max(average, 0),
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GradeDistribution({ distribution }) {
  if (!distribution.length) {
    return <EmptyAnalytics message="No grade distribution available." />;
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-700">
          Grade Distribution
        </h3>

        <p className="text-xs text-slate-400 mt-1">
          Distribution of grades across recorded results.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {distribution.map((item) => (
          <div
            key={item.grade}
            className="border border-slate-100 rounded-lg p-3"
          >
            <p className="text-xs text-slate-400">
              Grade
            </p>

            <p className="text-lg font-semibold text-slate-800">
              {item.grade}
            </p>

            <p className="text-xs text-slate-500 mt-1">
              {item.count} result{item.count === 1 ? "" : "s"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ResultAnalytics({
  results = [],
  studentId = null,
}) {
  const isStudentMode = Boolean(studentId);

  /*
   * --------------------------------------------------
   * BASIC SUMMARY
   * --------------------------------------------------
   */

  const summary = useMemo(() => {
    if (!results.length) {
      return {
        average: null,
        highest: null,
        lowest: null,
        subjects: 0,
      };
    }

    const averages = results
      .map((result) => Number(result.average_score))
      .filter((value) => !Number.isNaN(value));

    const average =
      averages.length > 0
        ? averages.reduce((sum, value) => sum + value, 0) /
          averages.length
        : null;

    const highest =
      averages.length > 0
        ? Math.max(...averages)
        : null;

    const lowest =
      averages.length > 0
        ? Math.min(...averages)
        : null;

    const subjectIds = new Set();

    results.forEach((result) => {
      (result.subject_scores || []).forEach((score) => {
        if (score.subject) {
          subjectIds.add(score.subject);
        }
      });
    });

    return {
      average,
      highest,
      lowest,
      subjects: subjectIds.size,
    };
  }, [results]);

  /*
   * --------------------------------------------------
   * SUBJECT PERFORMANCE
   * --------------------------------------------------
   */

  const subjectPerformance = useMemo(() => {
    const subjectMap = new Map();

    results.forEach((result) => {
      (result.subject_scores || []).forEach((score) => {
        const subjectId =
          score.subject || score.subject_id;

        const subjectName =
          score.subject_name ||
          `Subject ${subjectId}`;

        const numericScore = Number(score.score);

        if (
          subjectId === undefined ||
          Number.isNaN(numericScore)
        ) {
          return;
        }

        if (!subjectMap.has(subjectId)) {
          subjectMap.set(subjectId, {
            subject_id: subjectId,
            subject_name: subjectName,
            total: 0,
            count: 0,
          });
        }

        const subject = subjectMap.get(subjectId);

        subject.total += numericScore;
        subject.count += 1;
      });
    });

    return Array.from(subjectMap.values())
      .map((subject) => ({
        ...subject,
        average:
          subject.count > 0
            ? subject.total / subject.count
            : 0,
      }))
      .sort((a, b) => b.average - a.average);
  }, [results]);

  /*
   * --------------------------------------------------
   * TERM PERFORMANCE
   * --------------------------------------------------
   */

  const termPerformance = useMemo(() => {
    const termMap = new Map();

    results.forEach((result) => {
      const average = Number(result.average_score);

      if (Number.isNaN(average)) {
        return;
      }

      const key = `${result.academic_session}-${result.term}`;

      if (!termMap.has(key)) {
        termMap.set(key, {
          academic_session:
            result.academic_session || "—",
          term: result.term || "—",
          total: 0,
          count: 0,
        });
      }

      const item = termMap.get(key);

      item.total += average;
      item.count += 1;
    });

    return Array.from(termMap.values()).map((item) => ({
      ...item,
      average:
        item.count > 0
          ? item.total / item.count
          : 0,
    }));
  }, [results]);

  /*
   * --------------------------------------------------
   * SCHOOL-WIDE CLASS PERFORMANCE
   * --------------------------------------------------
   */

  const classPerformance = useMemo(() => {
    if (isStudentMode) {
      return [];
    }

    const classMap = new Map();

    results.forEach((result) => {
      const average = Number(result.average_score);

      if (Number.isNaN(average)) {
        return;
      }

      const className =
        result.classroom_name ||
        (result.level && result.grade
          ? `${result.level} ${result.grade}`
          : "Unknown Class");

      if (!classMap.has(className)) {
        classMap.set(className, {
          class_name: className,
          total: 0,
          count: 0,
        });
      }

      const item = classMap.get(className);

      item.total += average;
      item.count += 1;
    });

    return Array.from(classMap.values())
      .map((item) => ({
        ...item,
        average:
          item.count > 0
            ? item.total / item.count
            : 0,
      }))
      .sort((a, b) => b.average - a.average);
  }, [results, isStudentMode]);

  /*
   * --------------------------------------------------
   * GRADE DISTRIBUTION
   * --------------------------------------------------
   */

  const gradeDistribution = useMemo(() => {
    if (isStudentMode) {
      return [];
    }

    const distribution = new Map();

    results.forEach((result) => {
      const average = Number(result.average_score);

      if (Number.isNaN(average)) {
        return;
      }

      let grade;

      if (average >= 70) {
        grade = "A";
      } else if (average >= 60) {
        grade = "B";
      } else if (average >= 50) {
        grade = "C";
      } else if (average >= 45) {
        grade = "D";
      } else if (average >= 40) {
        grade = "E";
      } else {
        grade = "F";
      }

      distribution.set(
        grade,
        (distribution.get(grade) || 0) + 1
      );
    });

    return Array.from(distribution.entries())
      .map(([grade, count]) => ({
        grade,
        count,
      }))
      .sort((a, b) =>
        a.grade.localeCompare(b.grade)
      );
  }, [results, isStudentMode]);

  /*
   * --------------------------------------------------
   * EMPTY STATE
   * --------------------------------------------------
   */

  if (!results.length) {
    return (
      <div>
        <div className="mb-5">
          <h2 className="text-sm font-semibold text-slate-700">
            {isStudentMode
              ? "Result Overview"
              : "Results Overview"}
          </h2>

          <p className="text-xs text-slate-400 mt-1">
            {isStudentMode
              ? "Performance overview for this student."
              : "Performance overview across recorded school results."}
          </p>
        </div>

        <EmptyAnalytics />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-slate-700">
          {isStudentMode
            ? "Result Overview"
            : "Results Overview"}
        </h2>

        <p className="text-xs text-slate-400 mt-1">
          {isStudentMode
            ? "Performance overview for this student."
            : "Performance overview across recorded school results."}
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <SummaryCard
          label="Average"
          value={formatPercent(summary.average)}
          description={
            isStudentMode
              ? "Across recorded results"
              : "School-wide average"
          }
        />

        <SummaryCard
          label="Highest Average"
          value={formatPercent(summary.highest)}
        />

        <SummaryCard
          label="Lowest Average"
          value={formatPercent(summary.lowest)}
        />

        <SummaryCard
          label="Subjects"
          value={summary.subjects}
          description="Subjects with scores"
        />
      </div>

      {/* Student analytics */}
      {isStudentMode && (
        <div className="space-y-5">
          <SubjectPerformance
            subjects={subjectPerformance}
          />

          <TermPerformance
            terms={termPerformance}
          />
        </div>
      )}

      {/* School analytics */}
      {!isStudentMode && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <SubjectPerformance
              subjects={subjectPerformance}
            />

            <TermPerformance
              terms={termPerformance}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ClassPerformance
              classes={classPerformance}
            />

            <GradeDistribution
              distribution={gradeDistribution}
            />
          </div>
        </div>
      )}
    </div>
  );
}