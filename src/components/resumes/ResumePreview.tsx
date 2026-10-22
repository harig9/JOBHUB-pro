import React from 'react';
import { Resume, ResumeTemplateId } from '../../types/index.js';
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react';

interface ResumePreviewProps {
  resume: Resume;
  templateId?: ResumeTemplateId;
}

export function ResumePreview({ resume, templateId = 'modern-clean' }: ResumePreviewProps) {
  const activeTemplate = templateId || resume.templateId || 'modern-clean';

  const isSerif = activeTemplate === 'executive-serif';
  const isTech = activeTemplate === 'tech-minimal';
  const isCompact = activeTemplate === 'compact-ats';

  return (
    <div
      className={`resume-sheet w-full bg-white text-slate-900 shadow-2xl rounded-xl transition-all duration-300 ${
        isCompact ? 'p-8 max-w-[800px] text-[11px]' : 'p-10 max-w-[850px] text-xs'
      } ${isSerif ? 'font-serif' : 'font-sans'} mx-auto leading-normal selection:bg-slate-200`}
    >
      {/* Header / Personal Info */}
      <div className={`border-b ${isTech ? 'border-slate-900 border-b-2' : 'border-slate-300'} pb-4 mb-4`}>
        <div className="flex flex-col items-center text-center">
          <h1 className={`font-bold tracking-tight text-slate-950 uppercase ${isCompact ? 'text-2xl' : 'text-3xl'}`}>
            {resume.personalInfo.fullName || 'Candidate Name'}
          </h1>
          <p className="text-slate-600 font-medium tracking-wide mt-0.5 text-xs">
            {resume.targetRoles && resume.targetRoles.length > 0
              ? resume.targetRoles.join(' • ')
              : resume.title}
          </p>

          {/* Contact Bar */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-2 text-[11px] text-slate-700">
            {resume.personalInfo.email && <span>{resume.personalInfo.email}</span>}
            {resume.personalInfo.phone && <span>• {resume.personalInfo.phone}</span>}
            {resume.personalInfo.location && <span>• {resume.personalInfo.location}</span>}
            {resume.personalInfo.linkedin && <span>• {resume.personalInfo.linkedin}</span>}
            {resume.personalInfo.github && <span>• {resume.personalInfo.github}</span>}
            {resume.personalInfo.website && <span>• {resume.personalInfo.website}</span>}
          </div>
        </div>
      </div>

      {/* Professional Summary */}
      {resume.summary && (
        <div className="mb-4">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-1.5">
            Professional Summary
          </h2>
          <p className="text-slate-700 text-justify leading-relaxed">
            {resume.summary}
          </p>
        </div>
      )}

      {/* Work Experience */}
      {resume.experiences && resume.experiences.length > 0 && (
        <div className="mb-4">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
            Professional Experience
          </h2>
          <div className="space-y-3">
            {resume.experiences.map((exp) => (
              <div key={exp.id}>
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-slate-950 text-xs">
                    {exp.position} — <span className="font-semibold text-slate-800">{exp.company}</span>
                  </span>
                  <span className="text-[10px] font-medium text-slate-600 font-mono">
                    {exp.startDate} – {exp.endDate}
                  </span>
                </div>
                {exp.location && (
                  <div className="text-[10px] text-slate-500 italic mb-1">{exp.location}</div>
                )}
                <ul className="list-disc list-outside pl-4 space-y-1 text-slate-700 mt-1">
                  {exp.bulletPoints.map((bullet, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Core Technical & Professional Skills */}
      {resume.skills && resume.skills.length > 0 && (
        <div className="mb-4">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-1.5">
            Technical Skills & Competencies
          </h2>
          <div className="space-y-1 text-slate-700">
            {resume.skills.map((cat, i) => (
              <div key={i} className="flex flex-wrap items-baseline gap-1">
                <span className="font-bold text-slate-900 text-[11px] mr-1">{cat.category}:</span>
                <span className="text-slate-800">{cat.skills.join(', ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {resume.educations && resume.educations.length > 0 && (
        <div className="mb-4">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-1.5">
            Education
          </h2>
          <div className="space-y-1.5">
            {resume.educations.map((edu) => (
              <div key={edu.id} className="flex items-baseline justify-between">
                <div>
                  <span className="font-bold text-slate-900">{edu.institution}</span>
                  <span className="text-slate-700"> — {edu.degree} in {edu.fieldOfStudy}</span>
                  {edu.honors && <span className="text-slate-500 italic"> ({edu.honors})</span>}
                </div>
                <span className="text-[10px] font-medium text-slate-600 font-mono">
                  {edu.startDate} – {edu.endDate}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Projects */}
      {resume.projects && resume.projects.length > 0 && (
        <div className="mb-4">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-1.5">
            Key Engineering Projects
          </h2>
          <div className="space-y-2">
            {resume.projects.map((proj) => (
              <div key={proj.id}>
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-slate-900">{proj.name}</span>
                  {proj.technologies && (
                    <span className="text-[10px] text-slate-600 font-mono">
                      [{proj.technologies.join(', ')}]
                    </span>
                  )}
                </div>
                <p className="text-slate-700 mt-0.5 leading-relaxed">{proj.description}</p>
                {proj.metrics && (
                  <p className="text-[10px] font-semibold text-slate-800 mt-0.5">Impact: {proj.metrics}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {resume.certifications && resume.certifications.length > 0 && (
        <div>
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-1.5">
            Certifications & Credentials
          </h2>
          <div className="space-y-1">
            {resume.certifications.map((cert) => (
              <div key={cert.id} className="flex items-baseline justify-between text-slate-700">
                <span>
                  <strong className="text-slate-900">{cert.name}</strong> — {cert.issuer}
                </span>
                <span className="text-[10px] text-slate-600 font-mono">
                  Issued: {cert.issueDate}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
