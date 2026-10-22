import { jsPDF } from 'jspdf';
import { Resume, ResumeTemplateId } from '../types/index.js';

interface ExportPdfOptions {
  templateId?: ResumeTemplateId;
}

/**
 * Generates and downloads a clean, ATS-optimized vector text PDF resume.
 * All text elements are searchable, selectable, and fully parsable by ATS engines
 * (Greenhouse, Workday, Lever, Taleo, iCIMS).
 */
export function exportResumeToPdf(resume: Resume, options: ExportPdfOptions = {}): string {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter',
  });

  const template = options.templateId || resume.templateId || 'modern-clean';
  const isSerif = template === 'executive-serif';
  const isCompact = template === 'compact-ats';

  const fontPrimary = isSerif ? 'times' : 'helvetica';
  doc.setFont(fontPrimary);

  // Page geometry
  const pageWidth = doc.internal.pageSize.getWidth(); // 215.9mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 279.4mm
  const marginX = isCompact ? 14 : 18;
  const contentWidth = pageWidth - marginX * 2;
  const bottomLimit = pageHeight - 18;

  let cursorY = isCompact ? 14 : 18;

  const checkPageBreak = (neededHeight: number) => {
    if (cursorY + neededHeight > bottomLimit) {
      doc.addPage();
      cursorY = isCompact ? 14 : 18;
    }
  };

  const drawSectionHeading = (title: string) => {
    checkPageBreak(12);
    cursorY += isCompact ? 4 : 5;
    doc.setFont(fontPrimary, 'bold');
    doc.setFontSize(isCompact ? 9.5 : 10.5);
    doc.setTextColor(24, 30, 42); // slate-900

    doc.text(title.toUpperCase(), marginX, cursorY);
    cursorY += 2;

    // Subtle horizontal divider rule
    doc.setDrawColor(200, 205, 215);
    doc.setLineWidth(0.4);
    doc.line(marginX, cursorY, marginX + contentWidth, cursorY);
    cursorY += isCompact ? 3.5 : 4.5;
  };

  // ===================== HEADER / PERSONAL INFO =====================
  const candidateName = resume.personalInfo.fullName?.trim() || 'Candidate Name';
  doc.setFont(fontPrimary, 'bold');
  doc.setFontSize(isCompact ? 18 : 22);
  doc.setTextColor(15, 23, 42); // slate-950
  doc.text(candidateName.toUpperCase(), pageWidth / 2, cursorY, { align: 'center' });
  cursorY += isCompact ? 5.5 : 6.5;

  // Candidate Subtitle / Target Roles
  const targetRoleText =
    resume.targetRoles && resume.targetRoles.length > 0
      ? resume.targetRoles.join('  •  ')
      : resume.title || 'Professional Profile';

  doc.setFont(fontPrimary, 'normal');
  doc.setFontSize(isCompact ? 9.5 : 10.5);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text(targetRoleText, pageWidth / 2, cursorY, { align: 'center' });
  cursorY += isCompact ? 4.5 : 5.5;

  // Contact Info Line
  const contactParts: string[] = [];
  if (resume.personalInfo.email) contactParts.push(resume.personalInfo.email);
  if (resume.personalInfo.phone) contactParts.push(resume.personalInfo.phone);
  if (resume.personalInfo.location) contactParts.push(resume.personalInfo.location);
  if (resume.personalInfo.linkedin) contactParts.push(resume.personalInfo.linkedin.replace(/^https?:\/\//, ''));
  if (resume.personalInfo.github) contactParts.push(resume.personalInfo.github.replace(/^https?:\/\//, ''));
  if (resume.personalInfo.website) contactParts.push(resume.personalInfo.website.replace(/^https?:\/\//, ''));

  if (contactParts.length > 0) {
    doc.setFontSize(isCompact ? 8 : 8.5);
    doc.setTextColor(51, 65, 85); // slate-700
    const contactStr = contactParts.join('  |  ');
    const contactLines = doc.splitTextToSize(contactStr, contentWidth);
    doc.text(contactLines, pageWidth / 2, cursorY, { align: 'center' });
    cursorY += (contactLines.length * 3.8) + 2;
  }

  // Header bottom border
  doc.setDrawColor(180, 190, 205);
  doc.setLineWidth(0.6);
  doc.line(marginX, cursorY, marginX + contentWidth, cursorY);
  cursorY += 2;

  // ===================== PROFESSIONAL SUMMARY =====================
  if (resume.summary?.trim()) {
    drawSectionHeading('Professional Summary');
    doc.setFont(fontPrimary, 'normal');
    doc.setFontSize(isCompact ? 8.5 : 9.5);
    doc.setTextColor(30, 41, 59); // slate-800

    const summaryLines = doc.splitTextToSize(resume.summary.trim(), contentWidth);
    checkPageBreak(summaryLines.length * 4.2);
    doc.text(summaryLines, marginX, cursorY, { lineHeightFactor: 1.25 });
    cursorY += (summaryLines.length * 4.2) + 2;
  }

  // ===================== WORK EXPERIENCE =====================
  if (resume.experiences && resume.experiences.length > 0) {
    drawSectionHeading('Professional Experience');

    resume.experiences.forEach((exp) => {
      checkPageBreak(16);

      // Position (Left) & Dates (Right)
      doc.setFont(fontPrimary, 'bold');
      doc.setFontSize(isCompact ? 9 : 10);
      doc.setTextColor(15, 23, 42); // slate-950

      const positionText = `${exp.position || 'Role'}`;
      doc.text(positionText, marginX, cursorY);

      doc.setFont(fontPrimary, 'normal');
      doc.setFontSize(isCompact ? 8 : 8.5);
      doc.setTextColor(80, 95, 115);
      const dateText = `${exp.startDate || ''} – ${exp.endDate || 'Present'}`;
      doc.text(dateText, marginX + contentWidth, cursorY, { align: 'right' });
      cursorY += 4;

      // Company & Location
      doc.setFont(fontPrimary, 'bold');
      doc.setFontSize(isCompact ? 8.5 : 9);
      doc.setTextColor(51, 65, 85);
      let companyText = exp.company || '';
      if (exp.location) {
        companyText += `  •  ${exp.location}`;
      }
      doc.text(companyText, marginX, cursorY);
      cursorY += 3.5;

      // Bullet points
      if (exp.bulletPoints && exp.bulletPoints.length > 0) {
        doc.setFont(fontPrimary, 'normal');
        doc.setFontSize(isCompact ? 8.2 : 8.8);
        doc.setTextColor(30, 41, 59);

        exp.bulletPoints.forEach((bullet) => {
          if (!bullet.trim()) return;
          const bulletIndent = 4;
          const bulletTextWidth = contentWidth - bulletIndent;
          const bulletLines = doc.splitTextToSize(bullet.trim(), bulletTextWidth);

          checkPageBreak(bulletLines.length * 3.8 + 1.5);

          // Draw clean bullet circle/character
          doc.text('•', marginX + 0.5, cursorY);
          doc.text(bulletLines, marginX + bulletIndent, cursorY, { lineHeightFactor: 1.22 });
          cursorY += (bulletLines.length * 3.8) + 1.2;
        });
      }

      cursorY += 2;
    });
  }

  // ===================== TECHNICAL SKILLS =====================
  if (resume.skills && resume.skills.length > 0) {
    drawSectionHeading('Technical Competencies & Skills');
    doc.setFontSize(isCompact ? 8.2 : 9);

    resume.skills.forEach((skillGroup) => {
      if (!skillGroup.skills || skillGroup.skills.length === 0) return;
      checkPageBreak(6);

      const categoryLabel = `${skillGroup.category}: `;
      const skillsList = skillGroup.skills.join(', ');

      doc.setFont(fontPrimary, 'bold');
      doc.setTextColor(15, 23, 42);
      const labelWidth = doc.getTextWidth(categoryLabel);

      doc.text(categoryLabel, marginX, cursorY);

      doc.setFont(fontPrimary, 'normal');
      doc.setTextColor(40, 53, 72);

      const remainingWidth = contentWidth - labelWidth;
      const skillsLines = doc.splitTextToSize(skillsList, remainingWidth);

      if (skillsLines.length === 1) {
        doc.text(skillsLines[0], marginX + labelWidth, cursorY);
        cursorY += 4.5;
      } else {
        // Multi-line skills wrapped
        const fullText = `${categoryLabel}${skillsList}`;
        const allLines = doc.splitTextToSize(fullText, contentWidth);
        // Overwrite first line for proper alignment
        doc.text(skillsLines[0], marginX + labelWidth, cursorY);
        cursorY += 4;
        for (let i = 1; i < skillsLines.length; i++) {
          checkPageBreak(4.5);
          doc.text(skillsLines[i], marginX + 4, cursorY);
          cursorY += 4;
        }
        cursorY += 0.5;
      }
    });
  }

  // ===================== EDUCATION =====================
  if (resume.educations && resume.educations.length > 0) {
    drawSectionHeading('Education');

    resume.educations.forEach((edu) => {
      checkPageBreak(9);

      doc.setFont(fontPrimary, 'bold');
      doc.setFontSize(isCompact ? 8.8 : 9.5);
      doc.setTextColor(15, 23, 42);

      let degreeStr = `${edu.institution}`;
      if (edu.degree || edu.fieldOfStudy) {
        degreeStr += `  —  ${edu.degree} in ${edu.fieldOfStudy}`;
      }
      if (edu.honors) {
        degreeStr += ` (${edu.honors})`;
      }

      const degreeLines = doc.splitTextToSize(degreeStr, contentWidth - 40);
      doc.text(degreeLines, marginX, cursorY);

      doc.setFont(fontPrimary, 'normal');
      doc.setFontSize(isCompact ? 8 : 8.5);
      doc.setTextColor(80, 95, 115);
      const eduDate = `${edu.startDate || ''} – ${edu.endDate || ''}`;
      doc.text(eduDate, marginX + contentWidth, cursorY, { align: 'right' });

      cursorY += (degreeLines.length * 4.2) + 1.5;
    });
  }

  // ===================== KEY PROJECTS =====================
  if (resume.projects && resume.projects.length > 0) {
    drawSectionHeading('Key Engineering Projects');

    resume.projects.forEach((proj) => {
      checkPageBreak(12);

      doc.setFont(fontPrimary, 'bold');
      doc.setFontSize(isCompact ? 8.8 : 9.5);
      doc.setTextColor(15, 23, 42);

      doc.text(proj.name, marginX, cursorY);

      if (proj.technologies && proj.technologies.length > 0) {
        doc.setFont(fontPrimary, 'normal');
        doc.setFontSize(8);
        doc.setTextColor(90, 105, 125);
        const techStr = `[${proj.technologies.join(', ')}]`;
        doc.text(techStr, marginX + contentWidth, cursorY, { align: 'right' });
      }
      cursorY += 4;

      if (proj.description) {
        doc.setFont(fontPrimary, 'normal');
        doc.setFontSize(isCompact ? 8.2 : 8.8);
        doc.setTextColor(40, 53, 72);
        const descLines = doc.splitTextToSize(proj.description, contentWidth);
        checkPageBreak(descLines.length * 3.8);
        doc.text(descLines, marginX, cursorY, { lineHeightFactor: 1.2 });
        cursorY += (descLines.length * 3.8) + 1;
      }

      if (proj.metrics) {
        doc.setFont(fontPrimary, 'bold');
        doc.setFontSize(isCompact ? 7.8 : 8.2);
        doc.setTextColor(30, 41, 59);
        const metricsStr = `Impact: ${proj.metrics}`;
        const metricLines = doc.splitTextToSize(metricsStr, contentWidth);
        doc.text(metricLines, marginX, cursorY);
        cursorY += (metricLines.length * 3.8) + 1;
      }

      cursorY += 2;
    });
  }

  // ===================== CERTIFICATIONS =====================
  if (resume.certifications && resume.certifications.length > 0) {
    drawSectionHeading('Certifications & Credentials');

    resume.certifications.forEach((cert) => {
      checkPageBreak(7);

      doc.setFont(fontPrimary, 'bold');
      doc.setFontSize(isCompact ? 8.5 : 9);
      doc.setTextColor(15, 23, 42);
      doc.text(cert.name, marginX, cursorY);

      const issuerOffset = doc.getTextWidth(cert.name) + 2;
      doc.setFont(fontPrimary, 'normal');
      doc.setFontSize(isCompact ? 8 : 8.5);
      doc.setTextColor(60, 75, 95);
      doc.text(` — ${cert.issuer}`, marginX + issuerOffset, cursorY);

      if (cert.issueDate) {
        doc.text(`Issued: ${cert.issueDate}`, marginX + contentWidth, cursorY, { align: 'right' });
      }

      cursorY += 4.5;
    });
  }

  // ===================== FOOTER WITH PAGE NUMBERS =====================
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont(fontPrimary, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(140, 150, 165);

    const footerText = `${candidateName} • Resume`;
    doc.text(footerText, marginX, pageHeight - 8);

    if (totalPages > 1) {
      doc.text(`Page ${i} of ${totalPages}`, marginX + contentWidth, pageHeight - 8, { align: 'right' });
    }
  }

  // Clean filename
  const cleanName = (resume.personalInfo.fullName || 'Candidate')
    .trim()
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/_+/g, '_');
  const fileName = `${cleanName}_Resume.pdf`;

  // Trigger browser download
  doc.save(fileName);
  return fileName;
}
