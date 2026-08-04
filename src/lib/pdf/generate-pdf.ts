type ResumeSection = {
  title: string;
  content: string;
};

type GeneratedResumeContent = {
  sections: ResumeSection[];
  factsUsed?: string[];
};

type ResumeProfile = {
  fullName: string;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  linkedin?: string | null;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatContent(content: string): string {
  return escapeHtml(content).replaceAll("\n", "<br />");
}

export function generateResumeHtml(
  resume: GeneratedResumeContent,
  profile: ResumeProfile
): string {
  const contactParts = [
    profile.email,
    profile.phone,
    profile.location,
    profile.linkedin,
  ]
    .filter((value): value is string => Boolean(value && value.trim()))
    .map((value) => escapeHtml(value));

  const sectionsHtml = resume.sections
    .map((section) => {
      return `
    <section class="section">
      <h2>${escapeHtml(section.title)}</h2>
      <div class="content">${formatContent(section.content)}</div>
    </section>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(profile.fullName)} — Resume</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 24px;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 11pt;
      line-height: 1.45;
      color: #111;
      background: #fff;
    }
    .resume {
      max-width: 800px;
      margin: 0 auto;
    }
    h1 {
      margin: 0 0 6px;
      font-size: 20pt;
      font-weight: 700;
    }
    .contact {
      margin: 0 0 18px;
      color: #333;
      font-size: 10pt;
    }
    .section {
      margin: 0 0 16px;
      page-break-inside: avoid;
    }
    h2 {
      margin: 0 0 8px;
      padding-bottom: 4px;
      border-bottom: 1px solid #222;
      font-size: 12pt;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }
    .content {
      white-space: normal;
    }
    @media print {
      body { padding: 12mm; }
      a { color: inherit; text-decoration: none; }
    }
    @media (max-width: 640px) {
      body { padding: 16px; font-size: 10.5pt; }
      h1 { font-size: 18pt; }
    }
  </style>
</head>
<body>
  <main class="resume">
    <header>
      <h1>${escapeHtml(profile.fullName)}</h1>
      ${
        contactParts.length > 0
          ? `<p class="contact">${contactParts.join(" | ")}</p>`
          : ""
      }
    </header>
${sectionsHtml}
  </main>
</body>
</html>`;
}
