"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { cn } from "@/lib/utils";

type PersonalInfo = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  summary: string;
};

type ExperienceForm = {
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
  achievements: string;
  tools: string;
};

type EducationForm = {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
};

type FactPayload = {
  category: string;
  key: string;
  value: string;
  details?: string;
  confidence?: string;
  source?: string;
  allowedInCv?: boolean;
};

type FieldErrors = {
  fullName?: string;
  experience?: string;
  education?: string;
  experienceItems?: Record<number, string>;
  educationItems?: Record<number, string>;
};

const emptyPersonal: PersonalInfo = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  summary: "",
};

function emptyExperience(): ExperienceForm {
  return {
    company: "",
    title: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
    description: "",
    achievements: "",
    tools: "",
  };
}

function emptyEducation(): EducationForm {
  return {
    institution: "",
    degree: "",
    field: "",
    startDate: "",
    endDate: "",
  };
}

function nullToEmpty(value: string | null | undefined): string {
  return value ?? "";
}

function mapFacts(facts: unknown): FactPayload[] {
  if (!Array.isArray(facts)) {
    return [];
  }

  return facts
    .filter((fact): fact is Record<string, unknown> => {
      return typeof fact === "object" && fact !== null;
    })
    .map((fact) => ({
      category: String(fact.category ?? ""),
      key: String(fact.key ?? ""),
      value: String(fact.value ?? ""),
      details:
        fact.details === null || fact.details === undefined
          ? undefined
          : String(fact.details),
      confidence:
        fact.confidence === null || fact.confidence === undefined
          ? undefined
          : String(fact.confidence),
      source:
        fact.source === null || fact.source === undefined
          ? undefined
          : String(fact.source),
      allowedInCv:
        typeof fact.allowedInCv === "boolean" ? fact.allowedInCv : undefined,
    }))
    .filter((fact) => fact.category && fact.key && fact.value);
}

function mapExperience(items: unknown): ExperienceForm[] {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item) => {
    const record = (item ?? {}) as Record<string, unknown>;
    return {
      company: nullToEmpty(record.company as string | null | undefined),
      title: nullToEmpty(record.title as string | null | undefined),
      startDate: nullToEmpty(record.startDate as string | null | undefined),
      endDate: nullToEmpty(record.endDate as string | null | undefined),
      isCurrent: Boolean(record.isCurrent),
      description: nullToEmpty(record.description as string | null | undefined),
      achievements: nullToEmpty(
        record.achievements as string | null | undefined
      ),
      tools: nullToEmpty(record.tools as string | null | undefined),
    };
  });
}

function mapEducation(items: unknown): EducationForm[] {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item) => {
    const record = (item ?? {}) as Record<string, unknown>;
    return {
      institution: nullToEmpty(
        record.institution as string | null | undefined
      ),
      degree: nullToEmpty(record.degree as string | null | undefined),
      field: nullToEmpty(record.field as string | null | undefined),
      startDate: nullToEmpty(record.startDate as string | null | undefined),
      endDate: nullToEmpty(record.endDate as string | null | undefined),
    };
  });
}

const textareaClassName = "field-textarea";

function getInitials(fullName: string): string {
  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  if (parts.length === 0) {
    return "?";
  }
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

function experienceDurationLabel(item: ExperienceForm): string {
  if (item.isCurrent) {
    return "Current";
  }
  if (item.startDate.trim() && item.endDate.trim()) {
    return `${item.startDate} – ${item.endDate}`;
  }
  if (item.startDate.trim()) {
    return item.startDate;
  }
  return "Experience";
}

export default function ProfilePage() {
  const [step, setStep] = useState(1);
  const [personal, setPersonal] = useState<PersonalInfo>(emptyPersonal);
  const [experience, setExperience] = useState<ExperienceForm[]>([]);
  const [education, setEducation] = useState<EducationForm[]>([]);
  const [facts, setFacts] = useState<FactPayload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await fetch("/api/profile");

        if (response.status === 404) {
          if (!cancelled) {
            setPersonal(emptyPersonal);
            setExperience([]);
            setEducation([]);
            setFacts([]);
          }
          return;
        }

        if (!response.ok) {
          let message = "Unable to load profile.";
          try {
            const data = (await response.json()) as { error?: string };
            if (data.error) {
              message = data.error;
            }
          } catch {
            // keep default message
          }
          if (!cancelled) {
            setLoadError(message);
          }
          return;
        }

        const data = (await response.json()) as Record<string, unknown>;
        if (cancelled) {
          return;
        }

        setPersonal({
          fullName: nullToEmpty(data.fullName as string | null | undefined),
          email: nullToEmpty(data.email as string | null | undefined),
          phone: nullToEmpty(data.phone as string | null | undefined),
          location: nullToEmpty(data.location as string | null | undefined),
          linkedin: nullToEmpty(data.linkedin as string | null | undefined),
          summary: nullToEmpty(data.summary as string | null | undefined),
        });
        setExperience(mapExperience(data.experience));
        setEducation(mapEducation(data.education));
        setFacts(mapFacts(data.facts));
      } catch {
        if (!cancelled) {
          setLoadError("Unable to load profile.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  function updatePersonal<K extends keyof PersonalInfo>(
    key: K,
    value: PersonalInfo[K]
  ) {
    setPersonal((current) => ({ ...current, [key]: value }));
  }

  function updateExperience(
    index: number,
    key: keyof ExperienceForm,
    value: string | boolean
  ) {
    setExperience((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      )
    );
  }

  function updateEducation(
    index: number,
    key: keyof EducationForm,
    value: string
  ) {
    setEducation((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      )
    );
  }

  function validateStep1(): boolean {
    if (!personal.fullName.trim()) {
      setFieldErrors({ fullName: "Full name is required." });
      return false;
    }
    setFieldErrors({});
    return true;
  }

  function validateStep2(): boolean {
    const experienceItems: Record<number, string> = {};

    experience.forEach((item, index) => {
      if (!item.company.trim() || !item.title.trim() || !item.startDate.trim()) {
        experienceItems[index] =
          "Company, title, and start date are required.";
      }
    });

    if (Object.keys(experienceItems).length > 0) {
      setFieldErrors({
        experience: "Please complete required experience fields.",
        experienceItems,
      });
      return false;
    }

    setFieldErrors({});
    return true;
  }

  function validateStep3(): boolean {
    const educationItems: Record<number, string> = {};

    education.forEach((item, index) => {
      if (!item.institution.trim() || !item.degree.trim()) {
        educationItems[index] = "Institution and degree are required.";
      }
    });

    if (Object.keys(educationItems).length > 0) {
      setFieldErrors({
        education: "Please complete required education fields.",
        educationItems,
      });
      return false;
    }

    setFieldErrors({});
    return true;
  }

  function goNext() {
    setSaveError(null);
    setSuccessMessage(null);

    if (step === 1 && !validateStep1()) {
      return;
    }
    if (step === 2 && !validateStep2()) {
      return;
    }

    setStep((current) => Math.min(3, current + 1));
  }

  function goPrevious() {
    setSaveError(null);
    setSuccessMessage(null);
    setStep((current) => Math.max(1, current - 1));
  }

  async function saveProfile() {
    setSaveError(null);
    setSuccessMessage(null);

    if (!validateStep1()) {
      setStep(1);
      return;
    }
    if (!validateStep2()) {
      setStep(2);
      return;
    }
    if (!validateStep3()) {
      setStep(3);
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        fullName: personal.fullName.trim(),
        email: personal.email.trim() || undefined,
        phone: personal.phone.trim() || undefined,
        location: personal.location.trim() || undefined,
        linkedin: personal.linkedin.trim() || undefined,
        summary: personal.summary.trim() || undefined,
        experience: experience.map((item) => ({
          company: item.company.trim(),
          title: item.title.trim(),
          startDate: item.startDate.trim(),
          endDate: item.endDate.trim() || undefined,
          isCurrent: item.isCurrent,
          description: item.description.trim() || undefined,
          achievements: item.achievements.trim() || undefined,
          tools: item.tools.trim() || undefined,
        })),
        education: education.map((item) => ({
          institution: item.institution.trim(),
          degree: item.degree.trim(),
          field: item.field.trim() || undefined,
          startDate: item.startDate.trim() || undefined,
          endDate: item.endDate.trim() || undefined,
        })),
        facts,
      };

      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as Record<string, unknown> & {
        error?: string;
      };

      if (!response.ok) {
        setSaveError(data.error ?? "Unable to save profile.");
        return;
      }

      setPersonal({
        fullName: nullToEmpty(data.fullName as string | null | undefined),
        email: nullToEmpty(data.email as string | null | undefined),
        phone: nullToEmpty(data.phone as string | null | undefined),
        location: nullToEmpty(data.location as string | null | undefined),
        linkedin: nullToEmpty(data.linkedin as string | null | undefined),
        summary: nullToEmpty(data.summary as string | null | undefined),
      });
      setExperience(mapExperience(data.experience));
      setEducation(mapEducation(data.education));
      setFacts(mapFacts(data.facts));
      setSuccessMessage("Profile saved successfully.");
    } catch {
      setSaveError("Unable to save profile.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <main className="page-shell">
        <div className="mx-auto flex max-w-5xl items-center gap-3 text-slate-300">
          <LoadingSpinner className="h-5 w-5" />
          <p>Loading profile...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <div
                aria-hidden="true"
                className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-cyan-400 bg-cyan-500/10 text-lg font-bold text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.35)]"
              >
                {getInitials(personal.fullName)}
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-cyan-400">
                  Career Profile
                </h1>
                <p className="mt-1 text-sm font-medium text-slate-400">
                  Step {step} of 3
                </p>
              </div>
            </div>
            <Link href="/" className="page-link">
              Back to home
            </Link>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">
            Build your career profile once. ApplyMate uses it for job matching
            and tailored resumes without inventing experience.
          </p>
        </header>

        {loadError ? (
          <p role="alert" className="alert-error">
            {loadError}
          </p>
        ) : null}

        {saveError ? (
          <p role="alert" className="alert-error">
            {saveError}
          </p>
        ) : null}

        {successMessage ? (
          <p role="status" className="alert-success">
            {successMessage}
          </p>
        ) : null}

        {step === 1 ? (
          <Card title="👤 Personal information">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Full name"
                value={personal.fullName}
                onChange={(event) =>
                  updatePersonal("fullName", event.target.value)
                }
                error={fieldErrors.fullName}
                required
              />
              <Input
                label="Email"
                type="email"
                value={personal.email}
                onChange={(event) => updatePersonal("email", event.target.value)}
              />
              <Input
                label="Phone"
                value={personal.phone}
                onChange={(event) => updatePersonal("phone", event.target.value)}
              />
              <Input
                label="Location"
                value={personal.location}
                onChange={(event) =>
                  updatePersonal("location", event.target.value)
                }
              />
              <div className="sm:col-span-2">
                <Input
                  label="LinkedIn"
                  value={personal.linkedin}
                  onChange={(event) =>
                    updatePersonal("linkedin", event.target.value)
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="summary"
                  className="mb-1.5 block text-sm font-medium text-slate-300"
                >
                  Summary
                </label>
                <textarea
                  id="summary"
                  value={personal.summary}
                  onChange={(event) =>
                    updatePersonal("summary", event.target.value)
                  }
                  className={textareaClassName}
                  rows={4}
                />
              </div>
            </div>
          </Card>
        ) : null}

        {step === 2 ? (
          <div className="space-y-4">
            {fieldErrors.experience ? (
              <p role="alert" className="text-sm text-red-400">
                {fieldErrors.experience}
              </p>
            ) : null}

            {experience.length === 0 ? (
              <Card title="💼 Work experience">
                <p className="text-sm text-slate-400">
                  No experience added yet. Add your first role to continue.
                </p>
              </Card>
            ) : (
              <div className="relative space-y-4 border-l-2 border-cyan-500/40 pl-5 sm:pl-6">
                {experience.map((item, index) => (
                  <Card
                    key={`experience-${index}`}
                    className="relative"
                    title={`Experience ${index + 1}`}
                  >
                    <span
                      aria-hidden="true"
                      className="absolute -left-[1.7rem] top-7 h-3 w-3 rounded-full border-2 border-cyan-400 bg-[#0a0a0a] sm:-left-[1.95rem]"
                    />
                    <div className="mb-4">
                      <span className="inline-flex rounded-full border border-cyan-400/50 bg-cyan-500/10 px-2.5 py-0.5 text-xs font-medium text-cyan-300">
                        {experienceDurationLabel(item)}
                      </span>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        label="Company"
                        value={item.company}
                        onChange={(event) =>
                          updateExperience(index, "company", event.target.value)
                        }
                        error={fieldErrors.experienceItems?.[index]}
                        required
                      />
                      <Input
                        label="Title"
                        value={item.title}
                        onChange={(event) =>
                          updateExperience(index, "title", event.target.value)
                        }
                        required
                      />
                      <Input
                        label="Start date"
                        value={item.startDate}
                        onChange={(event) =>
                          updateExperience(index, "startDate", event.target.value)
                        }
                        placeholder="YYYY-MM"
                        required
                      />
                      <Input
                        label="End date"
                        value={item.endDate}
                        onChange={(event) =>
                          updateExperience(index, "endDate", event.target.value)
                        }
                        placeholder="YYYY-MM"
                        disabled={item.isCurrent}
                      />
                      <div className="sm:col-span-2">
                        <label className="inline-flex min-h-11 items-center gap-2 text-sm text-slate-300">
                          <input
                            type="checkbox"
                            checked={item.isCurrent}
                            onChange={(event) =>
                              updateExperience(
                                index,
                                "isCurrent",
                                event.target.checked
                              )
                            }
                            className="h-4 w-4 rounded border-slate-600 bg-[#111111] text-cyan-500 focus:ring-cyan-500"
                          />
                          Current role
                        </label>
                      </div>
                      <div className="sm:col-span-2">
                        <label
                          htmlFor={`experience-description-${index}`}
                          className="mb-1.5 block text-sm font-medium text-slate-300"
                        >
                          Description
                        </label>
                        <textarea
                          id={`experience-description-${index}`}
                          value={item.description}
                          onChange={(event) =>
                            updateExperience(
                              index,
                              "description",
                              event.target.value
                            )
                          }
                          className={textareaClassName}
                          rows={3}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label
                          htmlFor={`experience-achievements-${index}`}
                          className="mb-1.5 block text-sm font-medium text-slate-300"
                        >
                          Achievements
                        </label>
                        <textarea
                          id={`experience-achievements-${index}`}
                          value={item.achievements}
                          onChange={(event) =>
                            updateExperience(
                              index,
                              "achievements",
                              event.target.value
                            )
                          }
                          className={textareaClassName}
                          rows={3}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Input
                          label="Tools"
                          value={item.tools}
                          onChange={(event) =>
                            updateExperience(index, "tools", event.target.value)
                          }
                        />
                        {item.tools.trim() ? (
                          <ul className="mt-2 flex flex-wrap gap-2">
                            {item.tools
                              .split(/[,|]/)
                              .map((tool) => tool.trim())
                              .filter(Boolean)
                              .map((tool) => (
                                <li
                                  key={`${index}-${tool}`}
                                  className="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-2.5 py-0.5 text-xs text-cyan-300"
                                >
                                  {tool}
                                </li>
                              ))}
                          </ul>
                        ) : null}
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() =>
                          setExperience((current) =>
                            current.filter((_, itemIndex) => itemIndex !== index)
                          )
                        }
                      >
                        Remove experience
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                setExperience((current) => [...current, emptyExperience()])
              }
            >
              Add experience
            </Button>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-4">
            {fieldErrors.education ? (
              <p role="alert" className="text-sm text-red-400">
                {fieldErrors.education}
              </p>
            ) : null}

            {education.length === 0 ? (
              <Card title="🎓 Education">
                <p className="text-sm text-slate-400">
                  No education added yet. You can save without education or add
                  entries below.
                </p>
              </Card>
            ) : (
              <div className="relative space-y-4 border-l-2 border-cyan-500/40 pl-5 sm:pl-6">
                {education.map((item, index) => (
                  <Card
                    key={`education-${index}`}
                    className="relative"
                    title={`Education ${index + 1}`}
                  >
                    <span
                      aria-hidden="true"
                      className="absolute -left-[1.7rem] top-7 h-3 w-3 rounded-full border-2 border-cyan-400 bg-[#0a0a0a] sm:-left-[1.95rem]"
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        label="Institution"
                        value={item.institution}
                        onChange={(event) =>
                          updateEducation(index, "institution", event.target.value)
                        }
                        error={fieldErrors.educationItems?.[index]}
                        required
                      />
                      <Input
                        label="Degree"
                        value={item.degree}
                        onChange={(event) =>
                          updateEducation(index, "degree", event.target.value)
                        }
                        required
                      />
                      <Input
                        label="Field"
                        value={item.field}
                        onChange={(event) =>
                          updateEducation(index, "field", event.target.value)
                        }
                      />
                      <Input
                        label="Start date"
                        value={item.startDate}
                        onChange={(event) =>
                          updateEducation(index, "startDate", event.target.value)
                        }
                        placeholder="YYYY"
                      />
                      <Input
                        label="End date"
                        value={item.endDate}
                        onChange={(event) =>
                          updateEducation(index, "endDate", event.target.value)
                        }
                        placeholder="YYYY"
                      />
                    </div>
                    <div className="mt-4">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() =>
                          setEducation((current) =>
                            current.filter((_, itemIndex) => itemIndex !== index)
                          )
                        }
                      >
                        Remove education
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                setEducation((current) => [...current, emptyEducation()])
              }
            >
              Add education
            </Button>
          </div>
        ) : null}

        <div
          className={cn(
            "flex flex-col-reverse gap-3 sm:flex-row sm:items-center",
            step === 1 ? "sm:justify-end" : "sm:justify-between"
          )}
        >
          {step > 1 ? (
            <Button
              type="button"
              variant="secondary"
              onClick={goPrevious}
              disabled={isSaving}
            >
              Previous
            </Button>
          ) : (
            <span />
          )}

          {step < 3 ? (
            <Button type="button" variant="primary" onClick={goNext}>
              Next
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              isLoading={isSaving}
              disabled={isSaving}
              onClick={() => {
                void saveProfile();
              }}
            >
              Save Profile
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
