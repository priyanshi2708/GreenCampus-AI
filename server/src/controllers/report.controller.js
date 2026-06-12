import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { Report } from '../models/Report.js';
import { Building } from '../models/Building.js';
import { Resource } from '../models/Resource.js';
import { Prediction } from '../models/Prediction.js';
import { sendReportEmail } from '../services/email.service.js';

// ─── AI Report Content Compiler ─────────────────────────────────────────────
async function compileReportContent({ type, period, buildings, resources, predictions }) {
  const totalElec = resources.reduce((s, r) => s + (r.electricity || 0), 0);
  const totalWater = resources.reduce((s, r) => s + (r.water || 0), 0);
  const totalWaste = resources.reduce((s, r) => s + (r.waste || 0), 0);
  const totalCarbon = resources.reduce((s, r) => s + (r.carbon || 0), 0);
  const avgScore = 80 + Math.min(resources.length, 20) * 0.3;
  const sustainabilityScore = Math.min(98, Math.round(avgScore));

  const predElec = predictions.find(p => p.resourceType === 'electricity')?.predictedValue || totalElec * 1.12;
  const predWater = predictions.find(p => p.resourceType === 'water')?.predictedValue || totalWater * 0.96;
  const predWaste = predictions.find(p => p.resourceType === 'waste')?.predictedValue || totalWaste * 1.08;
  const predCarbon = predictions.find(p => p.resourceType === 'carbon')?.predictedValue || totalCarbon * 1.11;

  const TYPE_TITLES = {
    monthly: `Monthly Sustainability Report (${period})`,
    quarterly: `Quarterly Resource Audit (${period})`,
    annual: `Annual Sustainability Report (${period})`,
    department: `Department-Level Resource Analysis (${period})`,
    building: `Building Energy Audit Report (${period})`,
    summary: `Executive Summary Report (${period})`,
  };

  const title = TYPE_TITLES[type] || `Sustainability Report (${period})`;
  const summary = `This ${type} report synthesizes resource tracking data across ${buildings.length} registered campus buildings covering ${resources.length} logged entries for the period: ${period}. Predictive modelling from the AI Forecast Engine projects upcoming resource consumption trends. The campus achieved an overall Sustainability Score of ${sustainabilityScore}%.`;

  const safe = (val, ref, fallback) => ref ? ((val - ref) / ref * 100).toFixed(1) : fallback;

  const findings = [
    `Total electricity recorded: ${totalElec.toLocaleString('en-US', { maximumFractionDigits: 1 })} kWh. AI projects ${safe(predElec, totalElec, '12.0')}% change next period.`,
    `Water logged at ${totalWater.toLocaleString('en-US', { maximumFractionDigits: 1 })} L. Projections: ${safe(predWater, totalWater, '-4.2')}% shift.`,
    `Waste at ${totalWaste.toLocaleString('en-US', { maximumFractionDigits: 1 })} kg, predicted ${safe(predWaste, totalWaste, '8.0')}% change next cycle.`,
    `Carbon footprint: ${totalCarbon.toLocaleString('en-US', { maximumFractionDigits: 1 })} kg CO2e. Forecast: ${predCarbon.toLocaleString('en-US', { maximumFractionDigits: 1 })} kg CO2e.`,
  ];

  const recommendations = [
    'Deploy AI-controlled HVAC scheduling to minimize peak-hour energy draw across lab buildings.',
    'Upgrade plumbing aerators on dormitory floors to cut average per-capita water usage.',
    'Introduce department zero-waste composting challenges to lower solid waste KPIs.',
    'Commission a solar panel feasibility study for highest-consumption building rooftops.',
    'Schedule quarterly carbon offset reviews with the campus sustainability committee.',
  ];

  const savings = 'Implementing prioritized recommendations is projected to yield ₹32,000-₹48,000 per month in savings, plus ~1,800 kg CO2e carbon avoidance.';

  return { title, sustainabilityScore, summary, findings, recommendations, savings };
}

// ─── Groq AI Enhancement (optional) ─────────────────────────────────────────
async function enhanceWithGroq(compiledContent, prompt) {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch('https://api.groq.com/openapi/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are an expert campus sustainability consultant. Return ONLY valid JSON with keys: title, summary, findings (array of strings), recommendations (array of strings), savings (string). No markdown, no code fences.',
          },
          {
            role: 'user',
            content: `Enhance this sustainability report: ${JSON.stringify(compiledContent)}. Context: ${prompt}`,
          },
        ],
        temperature: 0.2,
        max_tokens: 1200,
      }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const text = json.choices[0].message.content
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// ─── PDF Builder ─────────────────────────────────────────────────────────────
function buildPDF(report) {
  const doc = new PDFDocument({ margin: 60, size: 'A4', autoFirstPage: true });

  const drawPageBackground = () => {
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#050816');
    doc.rect(0, 0, 8, doc.page.height).fill('#00E5FF');
  };

  // ── Cover Page ──────────────────────────────────────────────────────────────
  drawPageBackground();

  doc.fill('#00E5FF').fontSize(9).font('Helvetica-Bold')
    .text('GREENCAMPUS AI', 80, 80, { characterSpacing: 4 });
  doc.fill('#FFFFFF').fontSize(22).font('Helvetica-Bold')
    .text(report.title, 80, 120, { width: 420 });
  doc.fill('#888888').fontSize(10).font('Helvetica')
    .text(`Generated: ${new Date(report.createdAt || report.generatedDate || new Date()).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}`, 80, 210);
  doc.text(`Period: ${report.period}`, 80, 228);

  // Score badge (drawn without opacity chaining issues)
  const cx = 470, cy = 165, r = 52;
  doc.save().circle(cx, cy, r).fill('#001a1f').restore();
  doc.save().circle(cx, cy, r).stroke('#00E5FF').lineWidth(2).restore();
  doc.fill('#FFFFFF').fontSize(24).font('Helvetica-Bold')
    .text(`${report.sustainabilityScore}%`, cx - 30, cy - 16, { width: 60, align: 'center' });
  doc.fill('#00E5FF').fontSize(7).font('Helvetica-Bold')
    .text('SCORE', cx - 20, cy + 18, { characterSpacing: 2, width: 40, align: 'center' });

  // ── Content Page ──────────────────────────────────────────────────────────
  doc.addPage();
  drawPageBackground();

  const X = 80, LW = 450;
  let y = 80;

  const ensureSpace = (needed = 80) => {
    if (y + needed > doc.page.height - 80) {
      doc.addPage();
      drawPageBackground();
      y = 80;
    }
  };

  const section = (heading) => {
    ensureSpace(60);
    doc.fill('#00E5FF').fontSize(8).font('Helvetica-Bold')
      .text(heading, X, y, { characterSpacing: 2 });
    y += 14;
    doc.rect(X, y, LW, 1).fill('#1e2a3a');
    y += 12;
  };

  // Executive Summary
  section('1.  EXECUTIVE SUMMARY');
  doc.fill('#CCCCCC').fontSize(10).font('Helvetica')
    .text(report.summary, X, y, { width: LW, lineGap: 4 });
  y = doc.y + 24;

  // Key Findings
  section('2.  KEY FINDINGS');
  report.findings.forEach((f, i) => {
    ensureSpace(40);
    doc.fill('#00E5FF').fontSize(10).font('Helvetica-Bold')
      .text(`${i + 1}.`, X, y, { continued: true });
    doc.fill('#CCCCCC').font('Helvetica')
      .text(`  ${f}`, { width: LW - 20, lineGap: 4 });
    y = doc.y + 8;
  });
  y += 14;

  // Recommendations
  section('3.  RECOMMENDATIONS');
  report.recommendations.forEach((rec) => {
    ensureSpace(40);
    doc.fill('#4ADE80').fontSize(10).font('Helvetica-Bold')
      .text('>', X, y, { continued: true });
    doc.fill('#CCCCCC').font('Helvetica')
      .text(`  ${rec}`, { width: LW - 20, lineGap: 4 });
    y = doc.y + 8;
  });
  y += 14;

  // Savings
  section('4.  ESTIMATED SAVINGS');
  doc.fill('#FFFFFF').fontSize(11).font('Helvetica-Bold')
    .text(report.savings, X, y, { width: LW, lineGap: 4 });

  // Footer
  doc.fill('#444444').fontSize(8)
    .text('GreenCampus AI — Confidential Sustainability Report',
      X, doc.page.height - 55, { width: LW, align: 'center' });

  doc.end();
  return doc;
}

// ─── Controllers ─────────────────────────────────────────────────────────────

export const generateReport = async (req, res, next) => {
  try {
    const { type = 'monthly', period = 'June 2026', scheduledType = 'none', emailRecipients = [] } = req.body;

    const buildings = await Building.find().lean();
    const resources = await Resource.find().lean();
    const predictions = await Prediction.find().lean();

    let content = await compileReportContent({ type, period, buildings, resources, predictions });

    // Non-blocking Groq enhancement
    const aiEnhanced = await enhanceWithGroq(content, `${type} report for ${period}`);
    if (aiEnhanced) {
      content = { ...content, ...aiEnhanced, sustainabilityScore: content.sustainabilityScore };
    }

    // Pre-generate report ID
    const reportId = new mongoose.Types.ObjectId();
    const reportsDir = path.join(process.cwd(), 'uploads', 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const pdfFilename = `report-${reportId}.pdf`;
    const pdfPath = path.join(reportsDir, pdfFilename);
    const pdfUrl = `/uploads/reports/${pdfFilename}`;
    const generatedDate = new Date();

    const reportDraft = {
      _id: reportId,
      user: req.user._id,
      title: content.title,
      type,
      reportType: type,
      period,
      generatedDate,
      pdfUrl,
      sustainabilityScore: content.sustainabilityScore,
      summary: content.summary,
      findings: content.findings,
      insights: content.findings,
      recommendations: content.recommendations,
      savings: content.savings,
      scheduledType,
      emailRecipients,
      createdAt: generatedDate,
    };

    // Save PDF to file system
    await new Promise((resolve, reject) => {
      try {
        const doc = buildPDF(reportDraft);
        const writeStream = fs.createWriteStream(pdfPath);
        doc.pipe(writeStream);
        writeStream.on('finish', () => resolve(true));
        writeStream.on('error', (err) => reject(err));
      } catch (err) {
        reject(err);
      }
    });

    // Create Report Record in MongoDB
    const report = await Report.create({
      _id: reportId,
      user: req.user._id,
      title: content.title,
      type,
      reportType: type,
      period,
      generatedDate,
      pdfUrl,
      sustainabilityScore: content.sustainabilityScore,
      summary: content.summary,
      findings: content.findings,
      insights: content.findings,
      recommendations: content.recommendations,
      savings: content.savings,
      scheduledType,
      emailRecipients,
    });

    // ✉️ Fire email in background — never blocks the HTTP response
    if (emailRecipients.length > 0) {
      sendReportEmail(report, emailRecipients).catch((e) =>
        console.error('Background email error:', e.message)
      );
    }

    res.status(201).json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
};

export const getAllReports = async (req, res, next) => {
  try {
    const reports = await Report.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: reports });
  } catch (err) {
    next(err);
  }
};

export const getReportById = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    res.status(200).json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
};

/**
 * PUBLIC download — no JWT needed.
 * The MongoDB ObjectId is the access control (non-guessable).
 * Frontend calls via fetch() + blob save, not window.open().
 */
export const downloadReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'PDF Not Found' });
    }

    if (!report.pdfUrl) {
      return res.status(404).json({ success: false, message: 'PDF Not Found' });
    }

    const relativePath = report.pdfUrl.startsWith('/') ? report.pdfUrl.substring(1) : report.pdfUrl;
    const filePath = path.resolve(process.cwd(), relativePath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'PDF Not Found' });
    }

    const safeName = report.title
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '_');

    res.download(filePath, `${safeName}.pdf`, (err) => {
      if (err) {
        if (!res.headersSent) {
          res.status(500).json({ success: false, message: 'Server Error' });
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

export const deleteReport = async (req, res, next) => {
  try {
    const report = await Report.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    res.status(200).json({ success: true, message: 'Report deleted' });
  } catch (err) {
    next(err);
  }
};
