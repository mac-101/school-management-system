import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from "docx";

export async function downloadSchemeDoc(scheme) {
  const weeks = scheme.weeks || [];

  const children = [
    new Paragraph({
      text: scheme.subject_name || "Scheme of Work",
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
    }),

    new Paragraph({
      children: [
        new TextRun({
          text: `${scheme.level || ""} ${scheme.grade || ""}`,
          bold: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
    }),

    new Paragraph({
      children: [
        new TextRun({
          text: `${scheme.term || ""} • ${scheme.academic_session || ""}`,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: {
        after: 500,
      },
    }),
  ];

  if (weeks.length === 0) {
    children.push(
      new Paragraph({
        text: "No weeks have been added to this scheme yet.",
      })
    );
  } else {
    weeks.forEach((week) => {
      const subtopics = week.subtopics || [];

      children.push(
        new Paragraph({
          text: `Week ${week.week_number}`,
          heading: HeadingLevel.HEADING_1,
          spacing: {
            before: 300,
            after: 100,
          },
        })
      );

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Topic: ",
              bold: true,
            }),
            new TextRun({
              text: week.topic || "No topic",
            }),
          ],
          spacing: {
            after: 150,
          },
        })
      );

      if (subtopics.length === 0) {
        children.push(
          new Paragraph({
            text: "No subtopics added yet.",
            bullet: {
              level: 0,
            },
          })
        );
      } else {
        subtopics.forEach((subtopic) => {
          children.push(
            new Paragraph({
              text: subtopic.title,
              bullet: {
                level: 0,
              },
            })
          );
        });
      }
    });
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${scheme.subject_name || "scheme"}-${scheme.term || ""}-${scheme.academic_session || ""}.docx`
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "");

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.URL.revokeObjectURL(url);
}