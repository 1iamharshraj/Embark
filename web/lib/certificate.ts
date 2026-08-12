import { createCanvas, loadImage, CanvasRenderingContext2D } from "canvas";
import QRCode from "qrcode";

interface CertificateData {
  fullName: string;
  hackathonTitle: string;
  type: string;
  certificateId: string;
  issuedAt: Date;
  verificationUrl: string;
}

const WIDTH = 1200;
const HEIGHT = 850;

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function generateCertificateImage(data: CertificateData): Promise<Buffer> {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  // Background
  const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  gradient.addColorStop(0, "#FFF8F0");
  gradient.addColorStop(1, "#FFFFFF");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Border
  ctx.strokeStyle = "#1D4ED8";
  ctx.lineWidth = 12;
  ctx.strokeRect(24, 24, WIDTH - 48, HEIGHT - 48);

  ctx.strokeStyle = "#F97316";
  ctx.lineWidth = 4;
  ctx.strokeRect(40, 40, WIDTH - 80, HEIGHT - 80);

  // Header
  ctx.fillStyle = "#1D4ED8";
  ctx.font = "bold 28px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("EMBARK INDIA", WIDTH / 2, 110);

  ctx.fillStyle = "#374151";
  ctx.font = "20px sans-serif";
  ctx.fillText("Certificate of Recognition", WIDTH / 2, 155);

  // Award title
  ctx.fillStyle = "#F97316";
  ctx.font = "bold 42px sans-serif";
  const awardLabel = data.type.replace(/_/g, " ");
  ctx.fillText(awardLabel, WIDTH / 2, 215);

  // Presented to
  ctx.fillStyle = "#374151";
  ctx.font = "22px sans-serif";
  ctx.fillText("Presented to", WIDTH / 2, 290);

  ctx.fillStyle = "#111827";
  ctx.font = "bold 56px sans-serif";
  ctx.fillText(data.fullName, WIDTH / 2, 360);

  // Hackathon title
  ctx.fillStyle = "#4B5563";
  ctx.font = "24px sans-serif";
  const titleLines = wrapText(ctx, `for outstanding participation in ${data.hackathonTitle}`, 900);
  let y = 420;
  for (const line of titleLines) {
    ctx.fillText(line, WIDTH / 2, y);
    y += 36;
  }

  // Date and certificate ID
  ctx.fillStyle = "#6B7280";
  ctx.font = "18px sans-serif";
  ctx.fillText(`Issued on ${data.issuedAt.toLocaleDateString()}`, WIDTH / 2, y + 20);
  ctx.fillText(`Certificate ID: ${data.certificateId}`, WIDTH / 2, y + 50);

  // Verification URL
  ctx.fillStyle = "#1D4ED8";
  ctx.font = "16px sans-serif";
  ctx.fillText("Verify at:", WIDTH / 2, y + 95);
  ctx.fillText(data.verificationUrl, WIDTH / 2, y + 120);

  // QR code
  const qrBuffer = await QRCode.toBuffer(data.verificationUrl, { width: 180, margin: 1 });
  const qrImage = await loadImage(qrBuffer);
  ctx.drawImage(qrImage, WIDTH - 260, HEIGHT - 260, 180, 180);

  return canvas.toBuffer("image/png");
}

export function certificateTypeLabel(type: string): string {
  return type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
}

interface LegacyCertificateData {
  type: "participation" | "winner";
  competitionTitle: string;
  teamName: string;
  names: string[];
  rank?: number;
  date: string;
}

export function generateCertificate(data: LegacyCertificateData): Buffer {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  gradient.addColorStop(0, "#FFF8F0");
  gradient.addColorStop(1, "#FFFFFF");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.strokeStyle = "#1D4ED8";
  ctx.lineWidth = 12;
  ctx.strokeRect(24, 24, WIDTH - 48, HEIGHT - 48);

  ctx.strokeStyle = "#F97316";
  ctx.lineWidth = 4;
  ctx.strokeRect(40, 40, WIDTH - 80, HEIGHT - 80);

  ctx.fillStyle = "#1D4ED8";
  ctx.font = "bold 28px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("EMBARK INDIA", WIDTH / 2, 110);

  ctx.fillStyle = "#374151";
  ctx.font = "20px sans-serif";
  ctx.fillText("Certificate of Recognition", WIDTH / 2, 155);

  ctx.fillStyle = "#F97316";
  ctx.font = "bold 42px sans-serif";
  const label = data.type === "winner" && data.rank ? `Winner (Rank #${data.rank})` : "Participation";
  ctx.fillText(label, WIDTH / 2, 215);

  ctx.fillStyle = "#374151";
  ctx.font = "22px sans-serif";
  ctx.fillText("Presented to", WIDTH / 2, 290);

  ctx.fillStyle = "#111827";
  ctx.font = "bold 48px sans-serif";
  const names = data.names.slice(0, 4).join(", ") || data.teamName || "Participant";
  const nameLines = wrapText(ctx, names, 900);
  let y = 350;
  for (const line of nameLines) {
    ctx.fillText(line, WIDTH / 2, y);
    y += 56;
  }

  ctx.fillStyle = "#4B5563";
  ctx.font = "24px sans-serif";
  const titleLines = wrapText(ctx, `for ${data.type === "winner" ? "winning performance" : "participation"} in ${data.competitionTitle}`, 900);
  for (const line of titleLines) {
    ctx.fillText(line, WIDTH / 2, y + 10);
    y += 36;
  }

  if (data.teamName) {
    ctx.fillStyle = "#6B7280";
    ctx.font = "20px sans-serif";
    ctx.fillText(`Team: ${data.teamName}`, WIDTH / 2, y + 30);
  }

  ctx.fillStyle = "#6B7280";
  ctx.font = "18px sans-serif";
  ctx.fillText(`Issued on ${data.date}`, WIDTH / 2, HEIGHT - 120);

  return canvas.toBuffer("image/png");
}
